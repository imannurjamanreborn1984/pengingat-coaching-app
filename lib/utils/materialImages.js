/**
 * Helper to safely parse image_url from database npt_materials
 * Supports:
 * - single image URL string: "https://...jpg"
 * - JSON array string: '["https://...jpg", "https://...png"]'
 * - Comma separated string: "https://...jpg, https://...png"
 * - Array: ["https://...jpg"]
 * 
 * @param {string|string[]|null|undefined} val 
 * @returns {string[]} Array of valid image URLs
 */
export function parseImageUrls(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (e) {}
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}
