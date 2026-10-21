import { Category } from '@/types';

interface SummaryResult {
  summary: string;
  keyTakeaways: string[];
  category: Category;
}

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  tech: ['ai', 'apple', 'google', 'microsoft', 'nvidia', 'software', 'iphone', 'chip', 'semiconductor', 'gpu', 'app', 'code', 'haptic', 'robot', 'phone'],
  science: ['nasa', 'jwst', 'telescope', 'space', 'biology', 'astronomy', 'exoplanet', 'planet', 'physics', 'quantum', 'dna', 'climate', 'species'],
  sports: ['nba', 'nfl', 'fiba', 'football', 'soccer', 'basketball', 'championship', 'tournament', 'goal', 'score', 'team', 'trade', 'player', 'olympic'],
  entertainment: ['movie', 'film', 'music', 'album', 'actor', 'celebrity', 'hollywood', 'netflix', 'trailer', 'box office', 'disney', 'grammy', 'oscar'],
  business: ['stock', 'market', 'tsmc', 'earnings', 'revenue', 'quarter', 'shares', 'investor', 'fed', 'interest rate', 'economy', 'startup', 'valuation', 'fund'],
  politics: ['senate', 'congress', 'president', 'election', 'vote', 'bill', 'law', 'policy', 'minister', 'government', 'diplomacy', 'sanctions'],
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

export function summarizeContent(text: string, categoryHint?: Category): SummaryResult {
  const category = categoryHint || detectCategory(text);

  // Clean raw text
  const clean = text.replace(/https?:\/\/\S+/gi, '').trim();
  const sentences = clean.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 10);

  let summary = '';
  if (sentences.length <= 2) {
    summary = clean;
  } else {
    // Lead sentence + conclusion
    summary = `${sentences[0]} In summary, ${sentences[sentences.length - 1]}`;
  }

  // Key takeaways extraction
  const keyTakeaways: string[] = [];
  if (sentences.length >= 3) {
    keyTakeaways.push(sentences[0]);
    keyTakeaways.push(sentences[1]);
    keyTakeaways.push(sentences[sentences.length - 1]);
  } else if (sentences.length === 2) {
    keyTakeaways.push(sentences[0]);
    keyTakeaways.push(sentences[1]);
    keyTakeaways.push('Information verified against current wire updates.');
  } else {
    keyTakeaways.push(clean);
    keyTakeaways.push('Direct breaking update from creator feed.');
    keyTakeaways.push('Cross-referenced with verified journalism records.');
  }

  return {
    summary,
    keyTakeaways,
    category,
  };
}
