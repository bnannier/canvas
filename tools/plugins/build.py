#!/usr/bin/env python3
"""Offline, allowlisted plugin archives derived from an integrity-pinned npm release."""
import argparse
import base64
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import stat
import tarfile
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / 'consumer/plugin'
MAX_TARBALL = 64 * 1024 * 1024
MAX_UNPACKED = 128 * 1024 * 1024


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def regular_file(path):
    """Reject symlinks in every path segment, including external input parents."""
    path = Path(os.path.abspath(path))
    for part in [*reversed(path.parents), path]:
        if part.is_symlink():
            raise ValueError(f'Symlink is not permitted: {part}')
    if not path.is_file():
        raise ValueError(f'Expected a regular file: {path}')
    return path.read_bytes()


def safe_name(name):
    if not name or '\\' in name or name.startswith('/') or any(p in ('', '.', '..') for p in name.rstrip('/').split('/')):
        raise ValueError(f'Unsafe archive path: {name!r}')
    if PurePosixPath(name).parts[0] != 'package':
        raise ValueError(f'Entry outside npm package: {name!r}')


def published_files(tarball, lock):
    if len(tarball) > MAX_TARBALL:
        raise ValueError('Tarball exceeds size limit')
    expected = 'sha512-' + base64.b64encode(hashlib.sha512(tarball).digest()).decode()
    if expected != lock['integrity']:
        raise ValueError('Tarball integrity does not match the pinned npm release')
    selected = {}
    seen = set()
    size = 0
    with tarfile.open(fileobj=io.BytesIO(tarball), mode='r:gz') as archive:
        for member in archive:
            safe_name(member.name)
            if member.name in seen:
                raise ValueError(f'Duplicate archive entry: {member.name}')
            seen.add(member.name)
            if not member.isfile() and not member.isdir():
                raise ValueError(f'Non-regular archive entry: {member.name}')
            size += member.size
            if size > MAX_UNPACKED:
                raise ValueError('Unpacked archive exceeds size limit')
            if member.name in lock['files'] or member.name == 'package/package.json':
                if not member.isfile():
                    raise ValueError(f'Expected regular package member: {member.name}')
                selected[member.name] = archive.extractfile(member).read()
    metadata = json.loads(selected.pop('package/package.json'))
    if (metadata['name'], metadata['version']) != (lock['package'], lock['version']):
        raise ValueError('Published package identity/version mismatch')
    for name, digest in lock['files'].items():
        if name not in selected or sha256(selected[name]) != digest:
            raise ValueError(f'Published file hash mismatch: {name}')
    return selected


def canonical_json(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()


def package_files(platform, published, lock, root=ROOT):
    templates = root / 'consumer/plugin'
    manifest = json.loads(regular_file(templates / platform / 'plugin.json'))
    if manifest['name'] != 'canvas' or manifest['version'] != lock['version']:
        raise ValueError('Plugin identity/version must match the pinned release')
    allowed = {'name', 'version', 'description', 'author', 'homepage', 'keywords', 'repository'}
    allowed |= {'$schema', 'extensions'} if platform == 'openai' else {'displayName', 'icon', 'documentationUrl', 'supportUrl'}
    if set(manifest) - allowed:
        raise ValueError('Only skills-only metadata fields are permitted')
    if platform == 'openai' and manifest.get('$schema') != 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json':
        raise ValueError('Expected the portable Agent Plugins 1.0.0 schema')
    files = {
        'README.md': regular_file(templates / 'README.md'),
        'NOTICE.md': regular_file(templates / 'NOTICE.md'),
        'LICENSE': published['package/LICENSE'],
        'LICENSE.wrapper.txt': regular_file(templates / 'LICENSE.wrapper.txt'),
        'skills/canvas/SKILL.md': published['package/consumer/canvas/SKILL.md'],
    }
    # Compare with the canonical consumer skill without packaging checkout content.
    for source in ('consumer/canvas/SKILL.md', 'consumer/canvas/agents/openai.yaml'):
        if regular_file(root / source) != published['package/' + source]:
            raise ValueError(f'Canonical skill differs from the published release: {source}')
    for source, target in [('docs/public/favicon.svg', 'assets/canvas-mark.svg'), ('docs/assets/images/icon.png', 'assets/canvas-icon.png')]:
        data = regular_file(root / source)
        if sha256(data) != lock['assets'][source]:
            raise ValueError(f'Brand asset hash mismatch: {source}')
        files[target] = data
    if platform == 'openai':
        files['plugin.json'] = canonical_json(manifest)
        files['skills/canvas/agents/openai.yaml'] = published['package/consumer/canvas/agents/openai.yaml']
        extension = manifest['extensions']['com.openai']
        if set(extension) != {'interface'}:
            raise ValueError('Unexpected OpenAI extension capability')
        interface = extension['interface']
        for field, limit in [('displayName', 30), ('shortDescription', 30), ('longDescription', 4000), ('developerName', 80)]:
            if not isinstance(interface.get(field), str) or not 0 < len(interface[field]) <= limit:
                raise ValueError(f'Invalid listing field: {field}')
        for field in ('logo', 'composerIcon'):
            if interface[field].removeprefix('./') not in files:
                raise ValueError(f'Unpackaged listing icon: {field}')
    elif platform == 'claude':
        files['.claude-plugin/plugin.json'] = canonical_json(manifest)
    else:
        raise ValueError(f'Unsupported platform: {platform}')
    files['PROVENANCE.json'] = canonical_json({
        'package': lock['package'], 'version': lock['version'], 'tarball': lock['tarball'],
        'integrity': lock['integrity'], 'files': {name: sha256(data) for name, data in sorted(files.items())},
    })
    return files


def deterministic_zip(files):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_STORED) as archive:
        for name, data in sorted(files.items()):
            entry = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = (stat.S_IFREG | 0o644) << 16
            archive.writestr(entry, data)
    return output.getvalue()


def write_output(path, data):
    # Never follow an existing output symlink or replace a directory.
    for part in [*reversed(path.parents), path]:
        if part.is_symlink():
            raise ValueError(f'Symlink is not permitted: {part}')
    if path.exists() and not path.is_file():
        raise ValueError(f'Expected a regular output: {path}')
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as handle:
        temporary = Path(handle.name)
        handle.write(data)
    try:
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tarball', required=True, type=Path, help='Previously downloaded npm 4.1.0 tarball; never fetched by this builder')
    parser.add_argument('--out', type=Path, default=ROOT / '.artifacts/plugins/4.1.0')
    args = parser.parse_args()
    lock = json.loads(regular_file(TEMPLATE / 'release-lock.json'))
    published = published_files(regular_file(args.tarball), lock)
    outputs = {}
    for platform in ('openai', 'claude'):
        files = package_files(platform, published, lock)
        data = deterministic_zip(files)
        filename = f'canvas-{platform}-{lock["version"]}.zip'
        write_output(args.out / filename, data)
        outputs[filename] = {'sha256': sha256(data), 'bytes': len(data), 'files': sorted(files)}
    write_output(args.out / 'integrity.json', canonical_json(outputs))
    print(json.dumps({'output': str(args.out.resolve()), 'archives': outputs}, indent=2))


if __name__ == '__main__':
    main()
