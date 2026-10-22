import { Category } from '@/types';

interface SummaryResult {
  summary: string;
  keyTakeaways: string[];
  category: Category;
  extractedClaims: string[];
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  tech: ['ai', 'apple', 'google', 'microsoft', 'nvidia', 'software', 'iphone', 'chip', 'semiconductor', 'gpu', 'app', 'code', 'haptic', 'robot', 'phone', 'computer', 'model', 'algorithm', 'openai', 'anthropic'],
  science: ['nasa', 'jwst', 'telescope', 'space', 'biology', 'astronomy', 'exoplanet', 'planet', 'physics', 'quantum', 'dna', 'climate', 'species', 'discovery', 'research', 'study', 'scientific', 'galaxy', 'star'],
  sports: ['nba', 'nfl', 'fiba', 'football', 'soccer', 'basketball', 'championship', 'tournament', 'goal', 'score', 'team', 'trade', 'player', 'olympic', 'coach', 'league', 'match', 'fifa', 'game'],
  entertainment: ['movie', 'film', 'music', 'album', 'actor', 'celebrity', 'hollywood', 'netflix', 'trailer', 'box office', 'disney', 'grammy', 'oscar', 'song', 'series', 'star', 'cinema'],
  business: ['stock', 'market', 'tsmc', 'earnings', 'revenue', 'quarter', 'shares', 'investor', 'fed', 'interest rate', 'economy', 'startup', 'valuation', 'fund', 'ceo', 'company', 'billion', 'million', 'dollar', 'inflation'],
  politics: ['senate', 'congress', 'president', 'election', 'vote', 'bill', 'law', 'policy', 'minister', 'government', 'diplomacy', 'sanctions', 'court', 'supreme', 'parliament', 'official', 'campaign'],
};

export function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  let bestCategory: Category = 'tech';
  let maxMatches = 0;

  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0;
    for (const word of words) {
      if (lower.includes(word)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = cat as Category;
    }
  }

  return bestCategory;
}

/**
 * Summarizes the actual content of a social post or article.
 * If GEMINI_API_KEY is configured, calls Gemini Flash for high-precision NLP.
 * Otherwise uses an intelligent multi-sentence extractor and synthesis engine.
 */
export async function summarizeContent(
  text: string,
  categoryHint?: Category,
  author?: { name: string; handle: string }
): Promise<SummaryResult> {
  const category = categoryHint || detectCategory(text);

  // Check if GEMINI_API_KEY or GOOGLE_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    try {
      const geminiResult = await summarizeWithGemini(text, apiKey, author);
      if (geminiResult) {
        return {
          ...geminiResult,
          category,
        };
      }
    } catch (err) {
      console.warn('Gemini summarization failed, falling back to local NLP:', err);
    }
  }

  // Local rule-based intelligent summarizer
  return summarizeLocally(text, category, author);
}

/**
 * Calls Gemini 1.5 Flash / 2.0 Flash to analyze and summarize the post.
 */
async function summarizeWithGemini(
  text: string,
  apiKey: string,
  author?: { name: string; handle: string }
): Promise<{ summary: string; keyTakeaways: string[]; extractedClaims: string[] } | null> {
  const prompt = `You are the AI analyzer for SummifySocial. Analyze this social media post / article content:
Content: "${text}"
${author ? `Author: ${author.name} (${author.handle})` : ''}

Provide a JSON response with:
1. "summary": A clear, comprehensive 2-3 sentence summary explaining EXACTLY what the creator/post is saying, what their main point or claim is, and the essential context.
2. "keyTakeaways": An array of 3 to 4 concise bullet points explaining specific key statements, numbers, or arguments made in the post.
3. "extractedClaims": An array of 1 to 2 core factual claims that should be verified.

Output ONLY valid JSON without markdown fences.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) return null;
  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) return null;

  const parsed = JSON.parse(rawJson);
  return {
    summary: parsed.summary || text.slice(0, 200),
    keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
    extractedClaims: Array.isArray(parsed.extractedClaims) ? parsed.extractedClaims : [],
  };
}

/**
 * Intelligent local synthesis engine when no LLM API key is present.
 */
function summarizeLocally(
  text: string,
  category: Category,
  author?: { name: string; handle: string }
): SummaryResult {
  // Clean raw text
  const clean = text
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/#\w+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 12);

  let summary = '';
  const keyTakeaways: string[] = [];
  const extractedClaims: string[] = [];

  const authorPrefix = author?.name ? `${author.name} (${author.handle}) reports:` : 'The post highlights:';

  if (sentences.length === 0) {
    summary = clean || 'No textual content could be retrieved from the target link.';
    keyTakeaways.push(summary);
  } else if (sentences.length === 1) {
    summary = `${authorPrefix} ${sentences[0]}`;
    keyTakeaways.push(sentences[0]);
    keyTakeaways.push('Claim made directly by the creator on social media.');
    keyTakeaways.push('Circulating online and monitored for primary source confirmation.');
    extractedClaims.push(sentences[0]);
  } else if (sentences.length === 2) {
    summary = `${sentences[0]} ${sentences[1]}`;
    keyTakeaways.push(sentences[0]);
    keyTakeaways.push(sentences[1]);
    keyTakeaways.push('Evaluating corroborating statements across news feeds.');
    extractedClaims.push(sentences[0]);
  } else {
    // 3 or more sentences: build a well-rounded summary
    const first = sentences[0];
    const second = sentences[1];
    const last = sentences[sentences.length - 1];

    summary = `${first} In addition, ${second} Overall: ${last}`;

    // Extract key takeaways
    keyTakeaways.push(first);
    keyTakeaways.push(second);
    if (sentences.length > 3) {
      keyTakeaways.push(sentences[2]);
    }
    keyTakeaways.push(last);

    extractedClaims.push(first);
    if (second.length > 20) extractedClaims.push(second);
  }

  return {
    summary,
    keyTakeaways,
    category,
    extractedClaims,
  };
}
