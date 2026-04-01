export interface TemplateProps {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
  hydrationData?: string;
  baseSiteUrl?: string;
}

async function getAssetPaths(baseSiteUrl: string): Promise<{ js: string; css: string }> {
  const assetsUrl = `${baseSiteUrl}/cdn-assets.json`;
  try {
    const res = await fetch(assetsUrl);
    if (res.ok) {
      const data = await res.json();
      return { js: data.js, css: data.css };
    }
  } catch (e) {}
  
  try {
    const res = await fetch(`${baseSiteUrl}/?t=${Date.now()}`);
    const html = await res.text();
    const jsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    const cssMatch = html.match(/href="(\/assets\/index-[^"]+\.css)"/);
    return { 
      js: jsMatch ? jsMatch[1] : "/assets/index.js", 
      css: cssMatch ? cssMatch[1] : "/assets/index.css" 
    };
  } catch (e) {}
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
  const { js: jsAsset, css: cssAsset } = await getAssetPaths(baseSiteUrl);
  
  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
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
