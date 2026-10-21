import { Post, FollowedCreator } from '@/types';
import { summarizeContent } from './summarizer';
import { factCheckContent } from './factchecker';
import { getCreators, addPost } from './store';

// Curated live story bank for real-time streaming
const BREAKING_STORY_TEMPLATES = [
  {
    authorId: 'creator-x-mkbhd',
    platform: 'twitter' as const,
    originalContent: 'OpenAI just revealed an open-weights preview of their reasoning model, benchmarks show it matching frontier closed models in competitive mathematics and cybersecurity auditing.',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    link: 'https://x.com/MKBHD/status/1789391024',
    category: 'tech' as const,
  },
  {
    authorId: 'creator-fb-nasa',
    platform: 'facebook' as const,
    originalContent: 'Artemis II Orion spacecraft has completed final thermal vacuum chamber testing at Kennedy Space Center, clearing all milestone certifications for astronaut lunar flyby.',
    mediaUrl: 'https://images.unsplash.com/photo-1517976487502-5f654b06b026?w=1000&auto=format&fit=crop&q=80',
    link: 'https://facebook.com/NASA/posts/849301982',
    category: 'science' as const,
  },
  {
    authorId: 'creator-x-woj',
    platform: 'twitter' as const,
    originalContent: 'Golden State Warriors and Miami Heat have initiated formal discussions on a multi-team deal framework involving three future first-round picks before the draft deadline.',
    mediaUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1000&auto=format&fit=crop&q=80',
    link: 'https://x.com/ShamsCharania/status/1789401928',
    category: 'sports' as const,
  },
  {
    authorId: 'creator-x-varietymag',
    platform: 'twitter' as const,
    originalContent: 'Christopher Nolan sets his next film project at Universal with IMAX 70mm cameras engineered specifically for deep-sea underwater sequences. Release targeted for Summer 2026.',
    mediaUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000&auto=format&fit=crop&q=80',
    link: 'https://x.com/Variety/status/1789502910',
    category: 'entertainment' as const,
  },
  {
    authorId: 'creator-fb-bloomberg',
    platform: 'facebook' as const,
    originalContent: 'European Central Bank signals intention to introduce framework for digital euro interoperability with commercial bank settlement systems starting next quarter.',
    mediaUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80',
    link: 'https://facebook.com/Bloomberg/posts/99104051',
    category: 'business' as const,
  },
  {
    authorId: 'creator-tt-hankgreen',
    platform: 'tiktok' as const,
    originalContent: 'Viral claims on social media that drinking alkaline water alters cellular blood pH are biologically impossible. Your lungs and kidneys tightly buffer blood pH between 7.35 and 7.45.',
    mediaUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1000&auto=format&fit=crop&q=80',
    link: 'https://tiktok.com/@hankgreen1/video/72892049182',
    category: 'science' as const,
  }
];

let lastTemplateIndex = 0;

/**
 * Ingests a new post, runs summarization, extracts claims,
 * fact-checks it against sources, and saves it to the store.
 */
export async function processAndIngestPost(
  author: FollowedCreator,
  rawContent: string,
  mediaUrls: string[],
  originalUrl: string
): Promise<Post> {
  const { summary, keyTakeaways, category } = summarizeContent(rawContent, author.category);
  const factCheck = await factCheckContent(rawContent, category, author.handle);

  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    platform: author.platform,
    author: {
      name: author.name,
      handle: author.handle,
      avatarUrl: author.avatarUrl,
      verified: true,
      followers: '1.2M',
    },
    category,
    originalContent: rawContent,
    summary,
    keyTakeaways,
    mediaUrls,
    originalUrl,
    publishedAt: new Date().toISOString(),
    factCheck,
    engagement: {
      likes: Math.floor(Math.random() * 5000) + 120,
      shares: Math.floor(Math.random() * 900) + 35,
      comments: Math.floor(Math.random() * 400) + 15,
    },
  };

  addPost(newPost);
  return newPost;
}

/**
 * Generates the next breaking post from followed active creators.
 */
export async function generateNextLiveUpdate(): Promise<Post | null> {
  const creators = getCreators().filter(c => c.active);
  if (creators.length === 0) return null;

  const template = BREAKING_STORY_TEMPLATES[lastTemplateIndex % BREAKING_STORY_TEMPLATES.length];
  lastTemplateIndex++;

  // Match or pick a creator
  const matchedCreator = creators.find(c => c.id === template.authorId) || creators[0];

  return await processAndIngestPost(
    matchedCreator,
    template.originalContent,
    [template.mediaUrl],
    template.link
  );
}
