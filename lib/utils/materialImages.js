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

/**
 * Detect the video platform from a given URL
 * @param {string} url 
 * @returns {'youtube'|'tiktok'|'unknown'}
 */
export function detectVideoPlatform(url) {
  if (!url || typeof url !== 'string') return 'unknown';
  const clean = url.trim().toLowerCase();
  if (clean.includes('tiktok.com') || clean.includes('vt.tiktok.com')) {
    return 'tiktok';
  }
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    return 'youtube';
  }
  return 'unknown';
}

/**
 * Extract TikTok numeric video ID if present in full URL
 * @param {string} url 
 * @returns {string|null}
 */
export function extractTikTokVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:video|v|player\/v1)\/([0-9]{15,22})/);
  return match ? match[1] : null;
}

/**
 * Format TikTok video URL into official embed iframe URL
 * @param {string} url 
 * @returns {string|null}
 */
export function formatTikTokEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const videoId = extractTikTokVideoId(url);
  if (videoId) {
    return `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed`;
  }
  return null;
}

/**
 * Super helper to format video embed URL (supports YouTube & TikTok)
 * @param {string} url 
 * @returns {{ platform: 'youtube'|'tiktok'|'unknown', embedUrl: string|null, originalUrl: string, isShortlink: boolean }}
 */
export function formatVideoEmbed(url) {
  if (!url || typeof url !== 'string') {
    return { platform: 'unknown', embedUrl: null, originalUrl: '', isShortlink: false };
  }
  const clean = url.trim();
  const platform = detectVideoPlatform(clean);

  if (platform === 'youtube') {
    return {
      platform: 'youtube',
      embedUrl: formatYouTubeEmbedUrl(clean),
      originalUrl: clean,
      isShortlink: false
    };
  }

  if (platform === 'tiktok') {
    const videoId = extractTikTokVideoId(clean);
    const isShort = !videoId && (clean.includes('vt.tiktok.com') || clean.includes('/t/'));
    return {
      platform: 'tiktok',
      embedUrl: videoId ? `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed` : null,
      originalUrl: clean,
      isShortlink: isShort
    };
  }

  return {
    platform: 'unknown',
    embedUrl: null,
    originalUrl: clean,
    isShortlink: false
  };
}

/**
 * Format any document URL (Google Drive, OneDrive, direct PDF/PPT/Word) into an interactive embedded iframe URL.
 * @param {string} url 
 * @returns {{ embedUrl: string, originalUrl: string, isEmbeddable: boolean, provider: 'gdrive'|'gdocs'|'gslides'|'office'|'gviewer'|'direct' }}
 */
export function formatDocumentEmbedUrl(url) {
  if (!url || typeof url !== 'string') {
    return { embedUrl: '', originalUrl: '', isEmbeddable: false, provider: 'direct' };
  }
  const clean = url.trim();
  if (!clean || !clean.startsWith('http')) {
    return { embedUrl: '', originalUrl: clean, isEmbeddable: false, provider: 'direct' };
  }

  // 1. Google Drive /file/d/{id}
  const driveFileMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`,
      originalUrl: clean,
      isEmbeddable: true,
      provider: 'gdrive'
    };
  }

  // 2. Google Drive /open?id={id} or /uc?id={id}
  const driveIdMatch = clean.match(/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`,
      originalUrl: clean,
      isEmbeddable: true,
      provider: 'gdrive'
    };
  }

  // 3. Google Slides /presentation/d/{id}
  const slidesMatch = clean.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (slidesMatch && slidesMatch[1]) {
    return {
      embedUrl: `https://docs.google.com/presentation/d/${slidesMatch[1]}/embed?start=false&loop=false&delayms=3000`,
      originalUrl: clean,
      isEmbeddable: true,
      provider: 'gslides'
    };
  }

  // 4. Google Docs /document/d/{id}
  const docsMatch = clean.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docsMatch && docsMatch[1]) {
    return {
      embedUrl: `https://docs.google.com/document/d/${docsMatch[1]}/preview`,
      originalUrl: clean,
      isEmbeddable: true,
      provider: 'gdocs'
    };
  }

  // 5. Google Sheets /spreadsheets/d/{id}
  const sheetsMatch = clean.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetsMatch && sheetsMatch[1]) {
    return {
      embedUrl: `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/preview`,
      originalUrl: clean,
      isEmbeddable: true,
      provider: 'gdocs'
    };
  }

  // 6. Direct PDF link (native embed or Google Docs Viewer)
  return {
    embedUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(clean)}&embedded=true`,
    originalUrl: clean,
    isEmbeddable: true,
    provider: 'gviewer'
  };
}
