# Summify 📰✨
### Real-Time Social Media Aggregator, AI Summarizer & Fact-Checking Engine

Summify is a modern news aggregation platform that consolidates posts and news from followed creators across **X (Twitter)**, **Facebook**, **TikTok**, **YouTube**, **Reddit**, and **RSS feeds**. It filters through them, categorizes content (Science & Tech, Sports, Entertainment, Business, Politics), synthesizes concise AI summaries with key takeaways, cross-references claims against verified online sources, and provides a real-time fact-checking accuracy score.

---

## 🚀 Key Features

1. **Multi-Platform Creator Following**:
   - Follow news creators and channels across **X**, **Facebook**, **TikTok**, **YouTube**, **Reddit**, and **RSS**.
   - Manage followed accounts, pause monitoring, or add new creators in one click.

2. **Categorization & Smart Filtering**:
   - Automatic classification into **Tech & AI**, **Science & Space**, **Sports**, **Entertainment**, **Business & Finance**, and **World News**.
   - Instant filtering by Category, Platform, and Minimum Accuracy Score (e.g. 80%+ Verified).

3. **AI Summarization & Media Extraction**:
   - 1-2 sentence core summaries + bulleted key takeaways.
   - Preserves high-res images, thumbnails, author profile info, and original post links.
   - Expandable raw social media post viewer to compare the original post against the AI summary.

4. **Live Online Fact-Checking & Accuracy %**:
   - Automatic claim extraction from viral social posts.
   - Cross-referencing against verified journalistic outlets and scientific databases (Reuters, Associated Press, Bloomberg, Nature, ESPN, Snopes, IEEE Spectrum, etc.).
   - Transparent accuracy score ($0\% - 100\%$) with detailed Audit modal displaying source domains, evidence snippets, and reliability scores.

5. **Real-Time Feed Updates**:
   - Real-time updates with visual flash notifications when new stories arrive.
   - Built-in "Simulate Breaking Story" trigger to test real-time breaking news ingestion on demand.

6. **Fact-Check Any Post Tool**:
   - User-facing modal to paste any raw tweet, TikTok claim, or Facebook post to instantly summarize and fact-check it.

---

## 🏃 Running the Application

The application is running and accessible at:
👉 **[http://localhost:3050](http://localhost:3050)**

### NPM Scripts:
- `npm run dev`: Start Next.js in development mode on port 3050.
- `npm run build`: Compile and build production bundle.
- `npm run start`: Start production server on port 3050.

---

## 📡 API Endpoints

- `GET /api/posts`: Query summarized and fact-checked posts with query parameters (`?category=tech&platform=twitter&minAccuracy=80&query=apple`).
- `POST /api/posts`: Submit any social post or news text to summarize and fact-check live.
- `POST /api/feed/simulate`: Ingest the next breaking story from followed creators.
- `GET /api/creators`: List all followed creators and channels.
- `POST /api/creators`: Follow a new creator.
- `PATCH /api/creators/[id]`: Toggle monitoring on/off.
- `DELETE /api/creators/[id]`: Unfollow creator.
