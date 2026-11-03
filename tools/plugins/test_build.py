"""Packaging security and provenance regressions; synthetic archives stay temporary."""
import base64
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import stat
import tarfile
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('canvas_plugin_build', Path(__file__).with_name('build.py'))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


def archive_bytes(entries):
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode='w:gz') as archive:
        for name, content, kind in entries:
            info = tarfile.TarInfo(name)
            info.type = kind
            info.size = len(content)
            if kind == tarfile.SYMTYPE:
                info.linkname = '/private/secret'
            archive.addfile(info, io.BytesIO(content))
    return output.getvalue()


def pin(data, files):
    return {'package': '@nannier/canvas', 'version': '4.1.0',
            'integrity': 'sha512-' + base64.b64encode(hashlib.sha512(data).digest()).decode(),
            'files': {name: build.sha256(content) for name, content in files.items()}}


class PackagingTests(unittest.TestCase):
    def setUp(self):
        self.files = {'package/LICENSE': b'public npm license', 'package/consumer/canvas/SKILL.md': b'canonical public skill'}
        self.entries = [('package/package.json', json.dumps({'name': '@nannier/canvas', 'version': '4.1.0'}).encode(), tarfile.REGTYPE)]
        self.entries += [(name, content, tarfile.REGTYPE) for name, content in self.files.items()]

    def test_selects_only_pinned_public_files(self):
        data = archive_bytes(self.entries + [('package/private-note', b'must never be packaged', tarfile.REGTYPE)])
        self.assertEqual(build.published_files(data, pin(data, self.files)), self.files)

    def test_integrity_and_canonical_hash_are_required(self):
        data = archive_bytes(self.entries)
        lock = pin(data, self.files)
        with self.assertRaisesRegex(ValueError, 'integrity'):
            build.published_files(data + b'tamper', lock)
        lock['files']['package/LICENSE'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            build.published_files(data, lock)

    def test_wrong_package_identity_fails(self):
        entries = [('package/package.json', b'{"name":"private-source","version":"4.1.0"}', tarfile.REGTYPE)] + self.entries[1:]
        data = archive_bytes(entries)
        with self.assertRaisesRegex(ValueError, 'identity'):
            build.published_files(data, pin(data, self.files))

    def test_unsafe_paths_links_and_duplicates_fail_before_selection(self):
        for name, kind in [('../secret', tarfile.REGTYPE), ('/absolute', tarfile.REGTYPE), ('package/../secret', tarfile.REGTYPE), ('package/link', tarfile.SYMTYPE), ('package/LICENSE', tarfile.REGTYPE), ('elsewhere/file', tarfile.REGTYPE)]:
            with self.subTest(name=name, kind=kind):
                data = archive_bytes(self.entries + [(name, b'', kind)])
                with self.assertRaises(ValueError):
                    build.published_files(data, pin(data, self.files))

    def test_zip_is_reproducible_and_contains_regular_allowlisted_files(self):
        files = {'skills/canvas/SKILL.md': b'canonical', 'LICENSE': b'public'}
        first = build.deterministic_zip(files)
        self.assertEqual(first, build.deterministic_zip(dict(reversed(list(files.items())))))
        with zipfile.ZipFile(io.BytesIO(first)) as archive:
            self.assertEqual(archive.namelist(), sorted(files))
            for member in archive.infolist():
                self.assertEqual(member.date_time, (1980, 1, 1, 0, 0, 0))
                self.assertEqual(stat.S_IFMT(member.external_attr >> 16), stat.S_IFREG)

    def test_inputs_and_outputs_cannot_follow_symlinks(self):
        with tempfile.TemporaryDirectory(dir=Path(tempfile.gettempdir()).resolve()) as temporary:
            root = Path(temporary)
            (root / 'source').write_bytes(b'content')
            (root / 'link').symlink_to(root / 'source')
            with self.assertRaisesRegex(ValueError, 'Symlink'):
                build.regular_file(root / 'link')
            with self.assertRaisesRegex(ValueError, 'Symlink'):
                build.write_output(root / 'link', b'replacement')
            self.assertEqual((root / 'source').read_bytes(), b'content')

    def test_real_templates_use_only_the_intended_payload(self):
        lock = json.loads(build.regular_file(build.TEMPLATE / 'release-lock.json'))
        # This payload-selection test needs no generated root LICENSE. Integrity
        # verification is exercised separately against synthetic pinned archives.
        published = {
            name: b'Synthetic distribution license for packaging tests only.'
            if name == 'package/LICENSE'
            else build.regular_file(build.ROOT / name.removeprefix('package/'))
            for name in lock['files']
        }
        for platform in ('openai', 'claude'):
            files = build.package_files(platform, published, lock)
            expected = {'README.md', 'NOTICE.md', 'LICENSE', 'LICENSE.wrapper.txt', 'skills/canvas/SKILL.md', 'assets/canvas-mark.svg', 'assets/canvas-icon.png', 'PROVENANCE.json'}
            expected |= {'plugin.json', 'skills/canvas/agents/openai.yaml'} if platform == 'openai' else {'.claude-plugin/plugin.json'}
            self.assertEqual(set(files), expected)
            self.assertEqual(files['skills/canvas/SKILL.md'], published['package/consumer/canvas/SKILL.md'])
        published['package/consumer/canvas/SKILL.md'] += b'changed'
        with self.assertRaisesRegex(ValueError, 'Canonical skill differs'):
            build.package_files('openai', published, lock)


if __name__ == '__main__':
    unittest.main()
