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

/**
 * Helper to safely parse youtube_url from database npt_materials
 * Supports:
 * - single YouTube URL string: "https://youtube.com/watch?v=..."
 * - JSON array string: '["https://...", "https://..."]'
 * - Comma / newline separated string
 * - Array of strings
 * 
 * @param {string|string[]|null|undefined} val 
 * @returns {string[]} Array of valid YouTube URLs
 */
export function parseYouTubeUrls(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
        }
      } catch (e) {}
    }
    if (trimmed.includes('\n')) {
      return trimmed.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

/**
 * Convert any standard/short/embed YouTube URL into embeddable iframe URL
 * @param {string} url 
 * @returns {string} Embed URL
 */
export function formatYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();
  if (!cleanUrl) return '';

  // Shorts: /shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // youtu.be/VIDEO_ID
  const youtuMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuMatch && youtuMatch[1]) {
    return `https://www.youtube.com/embed/${youtuMatch[1]}`;
  }

  // watch?v=VIDEO_ID
  const watchMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // embed/VIDEO_ID
  const embedMatch = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) {
    return `https://www.youtube.com/embed/${embedMatch[1]}`;
  }

  return cleanUrl;
}

/**
 * Extract YouTube thumbnail image URL from YouTube video URL
 * @param {string} url 
 * @returns {string|null}
 */
export function getYouTubeThumbnailUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) return `https://img.youtube.com/vi/${shortsMatch[1]}/hqdefault.jpg`;
  const youtuMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuMatch && youtuMatch[1]) return `https://img.youtube.com/vi/${youtuMatch[1]}/hqdefault.jpg`;
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;
  const embedMatch = clean.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`;
  return null;
}
