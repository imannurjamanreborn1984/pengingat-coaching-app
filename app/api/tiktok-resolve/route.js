import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Parameter url diperlukan' }, { status: 400 });
  }

  try {
    const cleanUrl = targetUrl.trim();
    
    // Check if numeric ID is already in the URL
    const directMatch = cleanUrl.match(/(?:video|v|player\/v1)\/([0-9]{15,22})/);
    if (directMatch) {
      const videoId = directMatch[1];
      return NextResponse.json({
        resolvedUrl: cleanUrl,
        videoId,
        embedUrl: `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed`
      });
    }

    // Otherwise follow redirect (e.g. vt.tiktok.com)
    const response = await fetch(cleanUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const finalUrl = response.url || cleanUrl;
    const finalMatch = finalUrl.match(/(?:video|v|player\/v1)\/([0-9]{15,22})/);

    if (finalMatch) {
      const videoId = finalMatch[1];
      return NextResponse.json({
        resolvedUrl: finalUrl,
        videoId,
        embedUrl: `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed`
      });
    }

    // Try TikTok public oEmbed as second fallback
    try {
      const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(finalUrl)}`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        const html = oembedData.html || '';
        const idFromHtml = html.match(/data-video-id="([0-9]+)"/) || html.match(/\/video\/([0-9]+)/) || html.match(/\/player\/v1\/([0-9]+)/);
        if (idFromHtml) {
          const videoId = idFromHtml[1];
          return NextResponse.json({
            resolvedUrl: finalUrl,
            videoId,
            embedUrl: `https://www.tiktok.com/player/v1/${videoId}?embed_from=oembed`,
            title: oembedData.title,
            thumbnailUrl: oembedData.thumbnail_url
          });
        }
      }
    } catch (oe) {}

    return NextResponse.json({
      resolvedUrl: finalUrl,
      videoId: null,
      embedUrl: null,
      message: 'Tidak dapat menemukan ID video TikTok dari link ini'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
