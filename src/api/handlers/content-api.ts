// Content handler for blogs, stories, and search

interface ContentMetadata {
  slug: string;
  title: string;
  description: string;
  summary?: string;
  date: string;
  imageUrl?: string;
  tags?: string[];
  author?: string;
}

interface BlogPost extends ContentMetadata {
  content: string;
}

interface StoryPost extends ContentMetadata {
  content: string;
}

// In-memory cache for content (reduces R2 reads)
const contentCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  const data = await fetchFn();
  contentCache.set(key, { data, timestamp: Date.now() });
  return data;
}

function clearCache(prefix?: string): void {
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

function parseFrontmatter(content: string): { metadata: ContentMetadata; content: string } {
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

export async function handleBlogs(env?: any, slug?: string, latest?: number): Promise<Response> {
  try {
    if (!env?.CONTENT_BUCKET) {
      return new Response(JSON.stringify({ error: 'Content bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cacheKey = slug ? `blog-${slug}` : `blogs-list-${latest || 'all'}`;
    
    const result = await getCachedOrFetch(cacheKey, async () => {
      if (slug) {
        // Fetch content from .md file
        const mdObj = await env.CONTENT_BUCKET.get(`blogs/${slug}.md`);
        const jsonObj = await env.CONTENT_BUCKET.get(`blogs/${slug}.json`);
        
        if (!mdObj && !jsonObj) throw new Error('Blog not found');
        
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
        
        return { ...metadata, slug, content } as BlogPost;
      }

      const list = await env.CONTENT_BUCKET.list({ prefix: 'blogs/' });
      const blogs: ContentMetadata[] = [];
      
      for (const item of list.objects) {
        if (item.key.endsWith('.json')) {
          const obj = await env.CONTENT_BUCKET.get(item.key);
          if (obj) {
            const metadata = await obj.json() as ContentMetadata;
            const slug = item.key.replace('blogs/', '').replace('.json', '');
            blogs.push({ ...metadata, slug });
          }
        }
      }

      const sorted = blogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return latest ? sorted.slice(0, latest) : sorted;
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error serving blogs:', error);
    return new Response(JSON.stringify({ error: 'Blog not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function handleStories(env?: any, slug?: string, latest?: number): Promise<Response> {
  try {
    if (!env?.CONTENT_BUCKET) {
      return new Response(JSON.stringify({ error: 'Content bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cacheKey = slug ? `story-${slug}` : `stories-list-${latest || 'all'}`;
    
    const result = await getCachedOrFetch(cacheKey, async () => {
      if (slug) {
        const mdObj = await env.CONTENT_BUCKET.get(`stories/${slug}.md`);
        const jsonObj = await env.CONTENT_BUCKET.get(`stories/${slug}.json`);
        
        if (!mdObj && !jsonObj) throw new Error('Story not found');
        
        let metadata: any = {};
        if (jsonObj) {
          metadata = await jsonObj.json();
        }
        
        let content = '';
        if (mdObj) {
          const text = await mdObj.text();
          const parsed = parseFrontmatter(text);
          content = parsed.content;
          metadata = { ...parsed.metadata, ...metadata };
        }
        
        return { ...metadata, slug, content } as StoryPost;
      }

      const list = await env.CONTENT_BUCKET.list({ prefix: 'stories/' });
      const stories: ContentMetadata[] = [];
      
      for (const item of list.objects) {
        if (item.key.endsWith('.json')) {
          const obj = await env.CONTENT_BUCKET.get(item.key);
          if (obj) {
            const metadata = await obj.json() as ContentMetadata;
            const slug = item.key.replace('stories/', '').replace('.json', '');
            stories.push({ ...metadata, slug });
          }
        }
      }

      const sorted = stories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return latest ? sorted.slice(0, latest) : sorted;
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error serving stories:', error);
    return new Response(JSON.stringify({ error: 'Story not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function handleSearch(env?: any, query?: string): Promise<Response> {
  try {
    if (!env?.CONTENT_BUCKET) {
      return new Response(JSON.stringify({ error: 'Content bucket not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchResults = await getCachedOrFetch(`search-${query}`, async () => {
      const q = query.toLowerCase();
      const results: (BlogPost | StoryPost)[] = [];
      
      const [blogsList, storiesList] = await Promise.all([
        env.CONTENT_BUCKET.list({ prefix: 'blogs/' }),
        env.CONTENT_BUCKET.list({ prefix: 'stories/' })
      ]);

      for (const item of [...blogsList.objects, ...storiesList.objects]) {
        if (item.key.endsWith('.md')) {
          const obj = await env.CONTENT_BUCKET.get(item.key);
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
    });

    return new Response(JSON.stringify(searchResults), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error serving search:', error);
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export function clearContentCache(): void {
  clearCache();
}