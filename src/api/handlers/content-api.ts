// Content handler for blogs, stories, and search

import { createJSONResponse, createErrorResponse } from '../utils';
import {
  checkContentBucket,
  getCachedOrFetch,
  fetchContentItem,
  fetchContentList,
  searchContent,
  clearContentCache,
  type BlogPost,
  type StoryPost
} from '../content-utils';

export async function handleBlogs(env?: any, slug?: string, latest?: number): Promise<Response> {
  const bucketCheck = checkContentBucket(env);
  if (bucketCheck) return bucketCheck;

  try {
    const cacheKey = slug ? `blog-${slug}` : `blogs-list-${latest || 'all'}`;

    const result = await getCachedOrFetch(cacheKey, async () => {
      if (slug) {
        return await fetchContentItem(env.CONTENT_BUCKET, 'blogs', slug);
      }
      return await fetchContentList(env.CONTENT_BUCKET, 'blogs', latest);
    });

    return createJSONResponse(result);
  } catch (error) {
    console.error('Error serving blogs:', error);
    return createErrorResponse('Blog not found', 404);
  }
}

export async function handleStories(env?: any, slug?: string, latest?: number): Promise<Response> {
  const bucketCheck = checkContentBucket(env);
  if (bucketCheck) return bucketCheck;

  try {
    const cacheKey = slug ? `story-${slug}` : `stories-list-${latest || 'all'}`;

    const result = await getCachedOrFetch(cacheKey, async () => {
      if (slug) {
        return await fetchContentItem(env.CONTENT_BUCKET, 'stories', slug);
      }
      return await fetchContentList(env.CONTENT_BUCKET, 'stories', latest);
    });

    return createJSONResponse(result);
  } catch (error) {
    console.error('Error serving stories:', error);
    return createErrorResponse('Story not found', 404);
  }
}

export async function handleSearch(env?: any, query?: string): Promise<Response> {
  const bucketCheck = checkContentBucket(env);
  if (bucketCheck) return bucketCheck;

  if (!query) {
    return createErrorResponse('Search query required', 400);
  }

  try {
    const searchResults = await getCachedOrFetch(`search-${query}`, async () => {
      return await searchContent(env.CONTENT_BUCKET, query);
    });

    return createJSONResponse(searchResults);
  } catch (error) {
    console.error('Error serving search:', error);
    return createErrorResponse('Search failed', 500);
  }
}