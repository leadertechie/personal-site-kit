import { createJSONResponse, createErrorResponse } from './utils';

export interface ContentMetadata {
  slug: string;
  title: string;
  description: string;
  summary?: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
  author?: string;
}

export interface BlogPost extends ContentMetadata {
  content: string;
}

export interface StoryPost extends ContentMetadata {
  content: string;
}

// In-memory cache for content (reduces R2 reads)
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Promise.resolve(cached.data as T);
  }
  return fetchFn().then(data => {
    contentCache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}

export function clearContentCache(prefix?: string): void {
  if (prefix) {
    for (const key of contentCache.keys()) {
      if (key.startsWith(prefix)) {
        contentCache.delete(key);
      }
    }
  } else {
    contentCache.clear();
  }
}

export function parseFrontmatter(content: string): { metadata: ContentMetadata; content: string } {
  const lines = content.split('\n');
  const metadata: Record<string, string | string[]> = {};
  let contentStart = 0;

  if (lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === '---') {
        contentStart = i + 1;
        break;
      }
      const colonIdx = lines[i].indexOf(':');
      if (colonIdx > 0) {
        const key = lines[i].slice(0, colonIdx).trim();
        let value = lines[i].slice(colonIdx + 1).trim();
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1);
          metadata[key] = value.split(',').map(v => v.trim());
        } else {
          metadata[key] = value;
        }
      }
    }
  }

  return {
    metadata: metadata as unknown as ContentMetadata,
    content: lines.slice(contentStart).join('\n').trim()
  };
}

export function checkContentBucket(env: any): Response | null {
  if (!env?.CONTENT_BUCKET) {
    return createErrorResponse('Content bucket not configured', 500);
  }
  return null;
}

export async function fetchContentItem(bucket: any, type: 'blogs' | 'stories', slug: string): Promise<BlogPost | StoryPost> {
  const mdObj = await bucket.get(`${type}/${slug}.md`);
  const jsonObj = await bucket.get(`${type}/${slug}.json`);

  if (!mdObj && !jsonObj) throw new Error(`${type.slice(0, -1)} not found`);

  let metadata: any = {};
  if (jsonObj) {
    metadata = await jsonObj.json();
  }

  let content = '';
  if (mdObj) {
    const text = await mdObj.text();
    const parsed = parseFrontmatter(text);
    content = parsed.content;
    // Merge metadata from frontmatter if not in JSON
    metadata = { ...parsed.metadata, ...metadata };
  }

  return { ...metadata, slug, content } as BlogPost | StoryPost;
}

export async function fetchContentList(bucket: any, type: 'blogs' | 'stories', latest?: number): Promise<ContentMetadata[]> {
  const list = await bucket.list({ prefix: `${type}/` });
  const items: ContentMetadata[] = [];

  for (const item of list.objects) {
    if (item.key.endsWith('.json')) {
      const obj = await bucket.get(item.key);
      if (obj) {
        const metadata = await obj.json() as ContentMetadata;
        const slug = item.key.replace(`${type}/`, '').replace('.json', '');
        items.push({ ...metadata, slug });
      }
    }
  }

  const sorted = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return latest ? sorted.slice(0, latest) : sorted;
}

export async function searchContent(bucket: any, query: string): Promise<(BlogPost | StoryPost)[]> {
  const q = query.toLowerCase();
  const results: (BlogPost | StoryPost)[] = [];

  const [blogsList, storiesList] = await Promise.all([
    bucket.list({ prefix: 'blogs/' }),
    bucket.list({ prefix: 'stories/' })
  ]);

  for (const item of [...blogsList.objects, ...storiesList.objects]) {
    if (item.key.endsWith('.md')) {
      const obj = await bucket.get(item.key);
      if (obj) {
        const text = await obj.text();
        const { metadata } = parseFrontmatter(text);
        const matchTitle = metadata.title?.toLowerCase().includes(q);
        const matchDesc = metadata.description?.toLowerCase().includes(q);
        const matchTags = metadata.tags?.some((t: string) => t.toLowerCase().includes(q));

        if (matchTitle || matchDesc || matchTags) {
          results.push(metadata as BlogPost | StoryPost);
        }
      }
    }
  }

  return results;
}