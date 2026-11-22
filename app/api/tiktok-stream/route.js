// Cache resolved play URLs in memory (valid for 30 minutes) to enable instant scrubbing & range chunks
const playUrlCache = new Map();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Parameter url diperlukan', { status: 400 });
  }

  try {
    const cleanUrl = targetUrl.trim();

    // 1. Check cache first for rapid byte-range scrubbing
    let playUrl = null;
    const cached = playUrlCache.get(cleanUrl);
    if (cached && cached.expiresAt > Date.now()) {
      playUrl = cached.playUrl;
    }

    if (!playUrl) {
      // Fetch direct MP4 URL from TikWM API
      const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!tikwmRes.ok) {
        return new Response('Gagal menghubungi API TikTok', { status: 502 });
      }

      const data = await tikwmRes.json();
      playUrl = data?.data?.play || data?.data?.wmplay;

      if (!playUrl) {
        return new Response('Video TikTok tidak ditemukan', { status: 404 });
      }

      // Cache for 30 minutes
      playUrlCache.set(cleanUrl, {
        playUrl,
        expiresAt: Date.now() + 30 * 60 * 1000
      });
    }

    // 2. Prepare headers for upstream video CDN
    const upstreamHeaders = {
      'Referer': 'https://www.tiktok.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Forward range header if present (essential for iOS Safari & Android Chrome video scrub)
    const clientRange = request.headers.get('range');
    if (clientRange) {
      upstreamHeaders['Range'] = clientRange;
    }

    const videoStreamRes = await fetch(playUrl, {
      headers: upstreamHeaders
    });

    if (!videoStreamRes.ok && videoStreamRes.status !== 206) {
      // If cached URL expired upstream, invalidate cache and return error
      playUrlCache.delete(cleanUrl);
      return new Response('Gagal memuat stream video', { status: videoStreamRes.status });
    }

    // 3. Return video stream to client with standard video/mp4 headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', videoStreamRes.headers.get('content-type') || 'video/mp4');
    
    const cl = videoStreamRes.headers.get('content-length');
    if (cl) responseHeaders.set('Content-Length', cl);

    const cr = videoStreamRes.headers.get('content-range');
    if (cr) responseHeaders.set('Content-Range', cr);

    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    return new Response(videoStreamRes.body, {
      status: videoStreamRes.status,
      headers: responseHeaders
    });
  } catch (err) {
    console.error('TikTok stream error:', err);
    return new Response('Gagal streaming video: ' + err.message, { status: 500 });
  }
}
