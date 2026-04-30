export interface TemplateProps {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
  hydrationData?: string;
  baseSiteUrl?: string;
  jsAsset?: string;
  cssAsset?: string;
}

// In-memory cache for asset paths to avoid infinite recursion and multiple fetches
let cachedAssets: { js: string; css: string } | null = null;
let isDiscovering = false;

async function getAssetPaths(baseSiteUrl: string): Promise<{ js: string; css: string }> {
  if (cachedAssets) return cachedAssets;
  
  if (isDiscovering) {
    return { js: "/assets/index.js", css: "/assets/index.css" };
  }

  isDiscovering = true;

  try {
    const assetsUrl = `${baseSiteUrl}/cdn-assets.json`;
    const res = await fetch(assetsUrl);
    if (res.ok) {
      const data = await res.json();
      cachedAssets = { js: data.js, css: data.css };
      isDiscovering = false;
      return cachedAssets!;
    }
  } catch (e) {}
  
  try {
    // Try to fetch index.html to find hashed asset names
    const res = await fetch(`${baseSiteUrl}/index.html`);
    if (res.ok) {
      const html = await res.text();
      // Match scripts like /assets/index-HASH.js or assets/index-HASH.js
      const jsMatch = html.match(/src="([^"]*assets\/index-[^"]+\.js)"/);
      // Match links like /assets/index-HASH.css or assets/index-HASH.css
      const cssMatch = html.match(/href="([^"]*assets\/index-[^"]+\.css)"/);
      
      if (jsMatch || cssMatch) {
        cachedAssets = { 
          js: jsMatch ? (jsMatch[1].startsWith('/') ? jsMatch[1] : '/' + jsMatch[1]) : "/assets/index.js", 
          css: cssMatch ? (cssMatch[1].startsWith('/') ? cssMatch[1] : '/' + cssMatch[1]) : "/assets/index.css" 
        };
        isDiscovering = false;
        return cachedAssets!;
      }
    }
  } catch (e) {
    console.warn("Asset discovery failed:", e);
  } finally {
    isDiscovering = false;
  }
  
  return { js: "/assets/index.js", css: "/assets/index.css" };
}

export const createHtmlTemplate = async ({
  title,
  description,
  canonicalUrl,
  content,
  hydrationData = "",
  baseSiteUrl = "",
  jsAsset,
  cssAsset
}: TemplateProps): Promise<string> => {
  let js = jsAsset;
  let css = cssAsset;

  // If assets not provided, try to discover them
  if (!js || !css) {
    const effectiveBaseUrl = baseSiteUrl || new URL(canonicalUrl).origin;
    const discovered = await getAssetPaths(effectiveBaseUrl);
    js = js || discovered.js;
    css = css || discovered.css;
  }
  
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
    <link rel="stylesheet" crossorigin href="${css}" />
    <script type="module" crossorigin src="${js}"></script>
    <!-- md2interact: client-side DOM interactions, CSS hydration, and event bus -->
    <script type="module">
      import { init } from '@leadertechie/md2interact';
      document.addEventListener('DOMContentLoaded', () => {
        init({
          interactions: {
            'poll': { selector: '[data-interact="poll"]' },
            'live-update': { selector: '[data-interact="live-update"]' },
            'click-toggle': { selector: '[data-interact="click-toggle"]' },
            'infinite-scroll': { selector: '[data-interact="infinite-scroll"]' },
            'form-live': { selector: '[data-interact="form-live"]' }
          },
          cssHydration: {
            inlineCritical: true,
            layerInjection: true,
            themeToggle: true
          }
        });
      });
    </script>
  </head>
  <body>
    ${hydrationData}
    <div id="app">
      ${content}
    </div>
  </body>
</html>`;
};
