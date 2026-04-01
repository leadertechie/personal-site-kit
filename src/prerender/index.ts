import { createHtmlTemplate, TemplateProps } from "./template";

import { IFooterLink, IRoute, generatePageContent } from "./pageContent";

const routes: IRoute[] = [
  { link: "/", text: "Home" },
  { link: "/blogs", text: "Blogs" },
  { link: "/stories", text: "Stories" },
  { link: "/about-me", text: "About Me" },
];

// Default footer links (fallback)
const defaultFooterLinks: IFooterLink[] = [
  { text: "LinkedIn", link: "https://linkedin.com/in/yourname" },
  { text: "GitHub", link: "https://github.com/yourname" },
  { text: "Email", link: "mailto:yourname@domain.com" },
];

let footerLinks: IFooterLink[] = defaultFooterLinks;
let siteTitle = "My Personal Website";
let copyright = "2026 My Personal Website";

async function fetchStaticDetails(apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/api/static`);
    if (res.ok) {
      const data = await res.json();
      siteTitle = data.siteTitle || siteTitle;
      copyright = data.copyright || copyright;
      
      const normalizeUrl = (url?: string) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("www.")) return `https://${url}`;
        return url;
      };
      
      footerLinks = [
        { text: "LinkedIn", link: normalizeUrl(data.linkedin) || defaultFooterLinks[0].link },
        { text: "GitHub", link: normalizeUrl(data.github) || defaultFooterLinks[1].link },
        { text: "Email", link: data.email ? `mailto:${data.email}` : defaultFooterLinks[2].link },
      ];
    }
  } catch (e) {}
}

async function fetchAboutMeData(apiUrl: string): Promise<any> {
  try {
    const res = await fetch(`${apiUrl}/api/aboutme`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export default {
  async fetch(request: Request, env: any, ctx: any) {
    const apiUrl = env?.API_URL || "https://api.example.com";
    const baseSiteUrl = env?.BASE_SITE_URL || "https://site.example.com";

    await fetchStaticDetails(apiUrl);
    
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return fetch(`${apiUrl}${url.pathname}${url.search}`);
    }

    if (url.pathname.startsWith("/images/")) {
      const imageKey = url.pathname.slice(1);
      try {
        const image = await env.CONTENT_BUCKET.get(imageKey);
        if (image) {
          return new Response(image.body, {
            headers: {
              "content-type": image.httpMetadata?.contentType || "image/jpeg",
              "cache-control": "public, max-age=86400",
            },
          });
        }
      } catch (e) {}
      return new Response("Not found", { status: 404 });
    }

    if (url.pathname.startsWith("/assets/") || url.pathname === "/logo.png" || url.pathname === "/favicon.ico") {
      const path = url.pathname;
      const ext = path.split(".").pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        js: "application/javascript",
        css: "text/css",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        webp: "image/webp",
        ico: "image/x-icon",
      };
      const contentType = contentTypes[ext || ""] || "application/octet-stream";
      
      const response = await fetch(`${baseSiteUrl}${path}`);
      if (response.ok) {
        return new Response(response.body, {
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=31536000",
          },
        });
      }
      return new Response("Not found", { status: 404 });
    }

    const PRERENDERED_DOMAINS = [
      url.hostname
    ];

    if (!PRERENDERED_DOMAINS.includes(url.hostname) && !url.hostname.includes("localhost")) {
      return fetch(request);
    }

    let hydrationScript = "";
    if (url.pathname === "/about-me" || url.pathname === "/about-me/") {
      const aboutMeData = await fetchAboutMeData(apiUrl);
      if (aboutMeData) {
        hydrationScript = `<script>window.__HYDRATION_DATA__ = ${JSON.stringify(aboutMeData)};</script>`;
      }
    }

    const pageContent = await generatePageContent(url.pathname, routes, footerLinks, { ...env, apiUrl });
    const html = await createHtmlTemplate({ ...pageContent, hydrationData: hydrationScript });

    return new Response(html, {
      headers: {
        "content-type": "text/html",
        "cache-control": "public, max-age=60",
      },
    });
  },
};
