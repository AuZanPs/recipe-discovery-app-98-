// Shared formatting helper for recipe metadata presentation.
// Behavior:
// - Returns empty string if both absent (caller omits line)
// - Returns "cat | area" if both present
// - Returns whichever single non-empty value exists (no automatic fallback strings here)
//   (UI layer injects 'Uncategorized' or 'Global' when required.)
export function formatCategoryArea(category?: string | null, area?: string | null): string {
  const cat = (category || '').trim();
  const ar = (area || '').trim();
  if (!cat && !ar) return '';
  if (cat && ar) return `${cat} | ${ar}`;
  return cat || ar; // only one present
}

// Removed unused fallback helpers to avoid implying automatic placeholder usage.
