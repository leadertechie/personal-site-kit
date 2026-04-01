export interface TemplateProps {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
}

export const createHtmlTemplate = ({
  title,
  description,
  canonicalUrl,
  content
}: TemplateProps): string => {
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
    <link rel="stylesheet" href="/src/styles.css" />
    <script type="module" src="/src/index.ts"></script>
  </head>
  <body>
    <div id="app">
      ${content}
    </div>
  </body>
</html>`;
};