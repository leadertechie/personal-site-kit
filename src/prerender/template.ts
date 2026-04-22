export interface TemplateProps {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
  hydrationData?: string;
  baseSiteUrl?: string;
}

async function getAssetPaths(baseSiteUrl: string): Promise<{ js: string; css: string }> {
  // If baseSiteUrl is current origin, we can't fetch / to discover assets without loop risk
  // In that case, we assume standard naming or wait for a manifest
  if (baseSiteUrl.includes('localhost') || baseSiteUrl.includes('127.0.0.1')) {
    // For local dev, we typically use Vite's index.ts which resolves to a predictable bundle
    // but in prod build, it might have hashes.
  }

  const assetsUrl = `${baseSiteUrl}/cdn-assets.json`;
  try {
    const res = await fetch(assetsUrl);
    if (res.ok) {
      const data = await res.json();
      return { js: data.js, css: data.css };
    }
  } catch (e) {}
  
  try {
    // Only fetch / if it's NOT the current page to avoid loops
    // But since this is a template generator, we just try it once.
    const res = await fetch(`${baseSiteUrl}/?t=${Date.now()}`);
    const html = await res.text();
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
    
    if (jsMatch || cssMatch) {
      return { 
        js: jsMatch ? jsMatch[1] : "/assets/index.js", 
        css: cssMatch ? cssMatch[1] : "/assets/index.css" 
      };
    }
  } catch (e) {}
  
  // Fallback to predictable paths if discovery fails
  return { js: "/assets/index.js", css: "/assets/index.css" };
}

export const createHtmlTemplate = async ({
  title,
  description,
  canonicalUrl,
  content,
  hydrationData = "",
  baseSiteUrl = ""
}: TemplateProps): Promise<string> => {
  // Use the origin of the canonicalUrl as baseSiteUrl if not provided
  const effectiveBaseUrl = baseSiteUrl || new URL(canonicalUrl).origin;
  const { js: jsAsset, css: cssAsset } = await getAssetPaths(effectiveBaseUrl);
  
  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; font-src 'self' data: https:;" />
    <link rel="icon" type="image/svg+xml" href="/api/logo" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="stylesheet" crossorigin href="${cssAsset}" />
    <script type="module" crossorigin src="${jsAsset}"></script>
  </head>
  <body>
    ${hydrationData}
    <div id="app">
      ${content}
    </div>
  </body>
</html>`;
};
