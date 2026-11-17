/** The registry is searchable in full; only one small page mounts at a time. */
export const ICON_PAGE_SIZE = 32;

type PickerIcon = { readonly key: string; readonly label: string; readonly category: string };

export function iconPickerOptions<T extends PickerIcon>(registry: readonly T[], query: string, requestedPage: number, selected: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = registry.filter(icon => {
    const text = `${icon.key} ${icon.label} ${icon.category}`.toLowerCase();
    return words.every(word => text.includes(word));
  });
  const pages = Math.max(1, Math.ceil(matches.length / ICON_PAGE_SIZE));
  const page = Math.max(0, Math.min(pages - 1, requestedPage));
  const icons = matches.slice(page * ICON_PAGE_SIZE, (page + 1) * ICON_PAGE_SIZE);
  const current = registry.find(icon => icon.key === selected);
  // Keep the checked radio mounted when search or pagination hides its match.
  if (current && !icons.some(icon => icon.key === selected)) icons.unshift(current);
  return { icons, total: matches.length, page, pages };
}
