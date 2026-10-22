import { Platform, Category } from '@/types';

export interface ExtractedPostData {
  title: string;
  content: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  mediaUrl?: string;
  platform: Platform;
  publishedAt?: string;
  rawText?: string;
  isLoginWalled?: boolean;
}

/**
 * Detects whether extracted text or HTML is an authentication / login prompt
 * rather than genuine public social post content.
 */
export function isLoginWall(text?: string, title?: string): boolean {
  if (!text && !title) return false;
  const combined = `${title || ''} ${text || ''}`.toLowerCase();

  const loginWallSignatures = [
    'log into facebook',
    'log in to facebook',
    'facebook - log in',
    'log in or sign up',
    'sign up for facebook',
    'create new account',
    'you must log in to continue',
    'forgot password',
    'explore the things you love',
    'join facebook or log in',
    'log into your facebook account',
    'see more of .* on facebook',
    'sign in to x',
    'log in to twitter',
    'sign in - google accounts',
    'login • instagram',
    'join instagram to see',
  ];

  return loginWallSignatures.some(sig => combined.includes(sig));
}

export function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase();
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('reddit.com')) return 'reddit';
  return 'rss';
}

/**
 * Extracts Twitter / X post content via Twitter syndication or VxTwitter fallback.
 */
async function extractTwitterPost(url: string): Promise<ExtractedPostData | null> {
  const statusMatch = url.match(/status(?:es)?\/(\d+)/i);
  if (!statusMatch) return null;
  const tweetId = statusMatch[1];

  try {
    // 1. Twitter Syndication API (fast, reliable, official CDN)
    const syndicationUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=x`;
    const res = await fetch(syndicationUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        const authorName = data.user?.name || 'X Creator';
        const authorHandle = data.user?.screen_name ? `@${data.user.screen_name}` : '@x_user';
        const avatarUrl = data.user?.profile_image_url_https || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
        const mediaUrl = data.photos?.[0]?.url || data.video?.poster || undefined;

        return {
          title: `Post by ${authorName} (${authorHandle})`,
          content: data.text,
          authorName,
          authorHandle,
          avatarUrl,
          mediaUrl,
          platform: 'twitter',
          publishedAt: data.created_at,
          rawText: data.text,
        };
      }
    }
  } catch (err) {
    console.warn('Twitter syndication error:', err);
  }

  // 2. VxTwitter API fallback
  try {
    const vxUrl = `https://api.vxtwitter.com/Twitter/status/${tweetId}`;
    const res = await fetch(vxUrl, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          title: `Post by ${data.user_name || 'X User'}`,
          content: data.text,
          authorName: data.user_name || 'X Creator',
          authorHandle: data.user_screen_name ? `@${data.user_screen_name}` : '@x_user',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          mediaUrl: data.media_URLs?.[0] || undefined,
          platform: 'twitter',
          publishedAt: data.date,
          rawText: data.text,
        };
      }
    }
  } catch (err) {
    console.warn('VxTwitter fallback error:', err);
  }

  return null;
}

/**
 * Extracts YouTube video title, description, and author via oEmbed and page metadata.
 */
async function extractYouTubePost(url: string): Promise<ExtractedPostData | null> {
  try {
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { next: { revalidate: 120 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        return {
          title: data.title,
          content: `YouTube Video: "${data.title}" published by ${data.author_name || 'YouTube Creator'}. The video discusses and details: ${data.title}.`,
          authorName: data.author_name || 'YouTube Creator',
          authorHandle: `@${(data.author_name || 'creator').toLowerCase().replace(/\s+/g, '')}`,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          mediaUrl: data.thumbnail_url || undefined,
          platform: 'youtube',
          rawText: data.title,
        };
      }
    }
  } catch (err) {
    console.warn('YouTube extraction error:', err);
  }
  return null;
}

/**
 * Extracts Reddit post title, selftext, and author.
 */
async function extractRedditPost(url: string): Promise<ExtractedPostData | null> {
  try {
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    const jsonUrl = `${cleanUrl}.json`;
    const res = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SummifySocial/1.0',
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      const post = data?.[0]?.data?.children?.[0]?.data;
      if (post && post.title) {
        const fullContent = post.selftext ? `${post.title}. ${post.selftext}` : post.title;
        return {
          title: post.title,
          content: fullContent,
          authorName: post.author ? `u/${post.author}` : 'Reddit User',
          authorHandle: post.author ? `u/${post.author}` : '@reddit',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          mediaUrl: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : undefined,
          platform: 'reddit',
          rawText: fullContent,
        };
      }
    }
  } catch (err) {
    console.warn('Reddit extraction error:', err);
  }
  return null;
}

/**
 * Extracts Facebook post content using crawler user-agents (which return OpenGraph
 * metadata without the interactive JavaScript login wall) and detects auth walls.
 */
async function extractFacebookPost(url: string): Promise<ExtractedPostData | null> {
  const crawlerAgents = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Twitterbot/1.0',
    'WhatsApp/2.21.12.21 A',
  ];

  for (const userAgent of crawlerAgents) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        next: { revalidate: 60 },
      });

      if (res.ok) {
        const html = await res.text();

        const getMeta = (prop: string): string => {
          const match = html.match(new RegExp(`<meta[^>]*(?:property|name)=["'](?:og:|twitter:)?${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
                        html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["'](?:og:|twitter:)?${prop}["']`, 'i'));
          return match ? match[1].trim() : '';
        };

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = getMeta('title') || (titleMatch ? titleMatch[1].trim() : '');
        const description = getMeta('description');
        const image = getMeta('image');
        const author = getMeta('author') || getMeta('site_name') || 'Facebook User';

        // Check if Facebook returned an auth wall or login screen
        if (isLoginWall(description, title) || isLoginWall(html.slice(0, 1500))) {
          return {
            title: 'Facebook Post (Login Required)',
            content: '',
            authorName: 'Facebook',
            authorHandle: '@facebook',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            platform: 'facebook',
            isLoginWalled: true,
          };
        }

        if (description && description.length > 15 && !description.startsWith('Log into Facebook')) {
          const cleanDesc = description
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

          return {
            title: title || 'Facebook Post',
            content: cleanDesc,
            authorName: author || 'Facebook Creator',
            authorHandle: `@${(author || 'facebook').toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            mediaUrl: image || undefined,
            platform: 'facebook',
            rawText: cleanDesc,
            isLoginWalled: false,
          };
        }
      }
    } catch (err) {
      console.warn('Facebook extraction attempt failed:', err);
    }
  }

  return {
    title: 'Facebook Post (Login Required)',
    content: '',
    authorName: 'Facebook Creator',
    authorHandle: '@facebook',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    platform: 'facebook',
    isLoginWalled: true,
  };
}

/**
 * Extracts general web article or social post (Facebook, TikTok, Instagram, Web)
 * using HTML meta tags (OpenGraph, Twitter, schema.org) and Jina Reader fallback.
 */
async function extractWebOrSocialPost(url: string, platform: Platform): Promise<ExtractedPostData | null> {
  try {
    // 1. Direct fetch with browser headers
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const html = await res.text();

      // Extract OpenGraph & meta tags
      const getMeta = (prop: string): string => {
        const match = html.match(new RegExp(`<meta[^>]*(?:property|name)=["'](?:og:|twitter:)?${prop}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
                      html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["'](?:og:|twitter:)?${prop}["']`, 'i'));
        return match ? match[1].trim() : '';
      };

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = getMeta('title') || (titleMatch ? titleMatch[1].trim() : '');
      const description = getMeta('description');
      const image = getMeta('image');
      const author = getMeta('author') || getMeta('creator') || getMeta('site_name');

      // Check for login wall
      if (isLoginWall(description, title) || isLoginWall(html.slice(0, 1500))) {
        return {
          title: `${platform.toUpperCase()} Post (Login Required)`,
          content: '',
          authorName: `${platform.toUpperCase()} Creator`,
          authorHandle: `@${platform}`,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          platform,
          isLoginWalled: true,
        };
      }

      if (title || description) {
        const fullContent = description ? `${title}. ${description}` : title;
        // Clean HTML entities if any
        const cleanContent = fullContent
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        return {
          title: title || `${platform.toUpperCase()} Post`,
          content: cleanContent,
          authorName: author || `${platform.toUpperCase()} Creator`,
          authorHandle: `@${(author || platform).toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          mediaUrl: image || undefined,
          platform,
          rawText: cleanContent,
          isLoginWalled: false,
        };
      }
    }
  } catch (err) {
    console.warn('Direct web extraction error:', err);
  }

  // 2. Jina Reader API fallback (executes JS, bypasses anti-bot blocks, returns clean markdown)
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const jinaRes = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
      },
      next: { revalidate: 60 },
    });

    if (jinaRes.ok) {
      const text = await jinaRes.text();
      if (text && text.length > 50) {
        // Parse Title and content from Jina markdown
        const titleMatch = text.match(/Title:\s*(.+)/i);
        const title = titleMatch ? titleMatch[1].trim() : `${platform.toUpperCase()} Post`;

        // Strip Jina headers
        const bodyContent = text
          .replace(/^Title:.*$/m, '')
          .replace(/^URL Source:.*$/m, '')
          .replace(/^Published Time:.*$/m, '')
          .replace(/^Markdown Content:.*$/m, '')
          .trim()
          .slice(0, 1200);

        // Check for login wall in Jina markdown output
        if (isLoginWall(bodyContent, title)) {
          return {
            title: `${platform.toUpperCase()} Post (Login Required)`,
            content: '',
            authorName: `${platform.toUpperCase()} Creator`,
            authorHandle: `@${platform}`,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            platform,
            isLoginWalled: true,
          };
        }

        return {
          title,
          content: bodyContent.length > 30 ? bodyContent : title,
          authorName: `${platform.toUpperCase()} Creator`,
          authorHandle: `@${platform}`,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          platform,
          rawText: bodyContent,
          isLoginWalled: false,
        };
      }
    }
  } catch (err) {
    console.warn('Jina Reader fallback error:', err);
  }

  return null;
}

/**
 * Main link extraction entry point.
 * Given any social link or web URL, retrieves the real title, author, and content.
 */
export async function extractPostFromUrl(url: string): Promise<ExtractedPostData> {
  const platform = detectPlatform(url);

  let extracted: ExtractedPostData | null = null;

  if (platform === 'twitter') {
    extracted = await extractTwitterPost(url);
  } else if (platform === 'facebook') {
    extracted = await extractFacebookPost(url);
  } else if (platform === 'youtube') {
    extracted = await extractYouTubePost(url);
  } else if (platform === 'reddit') {
    extracted = await extractRedditPost(url);
  } else {
    extracted = await extractWebOrSocialPost(url, platform);
  }

  // If the post is behind an authentication wall, return immediately
  if (extracted?.isLoginWalled) {
    return extracted;
  }

  if (extracted && extracted.content && extracted.content.trim().length > 10) {
    return extracted;
  }

  // Fallback: If network / bot detection prevented full extraction, parse the URL slug
  const urlParts = url.replace(/^https?:\/\//, '').split('/');
  const domain = urlParts[0] || platform;
  const slug = urlParts.slice(1).join(' ')
    .replace(/[-_?&=]/g, ' ')
    .replace(/\b(status|posts|videos|watch|shorts|p|comments)\b/gi, '')
    .trim();

  const title = slug.length > 5
    ? slug.slice(0, 100)
    : `Post on ${domain}`;

  return {
    title,
    content: `Content shared via ${domain}: "${title}". Evaluating circulating claims and context against primary reporting wire services.`,
    authorName: `${platform.toUpperCase()} Creator`,
    authorHandle: `@${platform}`,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    platform,
    rawText: title,
    isLoginWalled: false,
  };
}
