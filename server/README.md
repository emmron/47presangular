# News Aggregation Backend

This NestJS service aggregates content from official RSS feeds, licensed APIs, and social media JSON feeds. Articles are normalized into a PostgreSQL database via Prisma and exposed through REST endpoints for the Angular frontend.

## Getting Started

```bash
cd server
npm install
cp .env.example .env
# Update credentials inside .env
npx prisma generate
npm run start:dev
```

The server listens on `PORT` (defaults to `3000`) and exposes `GET /api/news`.

## Environment Variables

| Name | Description |
|------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. |
| `OFFICIAL_FEEDS` | Comma separated list of RSS feed URLs. |
| `NEWS_API_URL`, `NEWS_API_KEY`, `NEWS_API_QUERY` | Configuration for NewsAPI ingestion. |
| `NYT_API_URL`, `NYT_API_KEY`, `NYT_API_QUERY` | Configuration for New York Times ingestion. |
| `SOCIAL_FEEDS` | Comma separated list of social feed JSON endpoints. |

## API

### `GET /api/news`

Query Parameters:

- `page` (default `1`)
- `pageSize` (default `20`)
- `sources` (`slug,slug`)
- `topics` (`slug,slug`)
- `search` (full-text query)

Response:

```json
{
  "items": [
    {
      "id": "clvx...",
      "title": "Headline",
      "summary": "...",
      "link": "https://example.com",
      "publishedAt": "2024-05-21T14:25:00.000Z",
      "source": {
        "name": "Official Campaign",
        "slug": "official-campaign",
        "type": "OFFICIAL",
        "url": "https://...",
        "author": "Campaign Staff"
      },
      "topics": ["campaign", "fundraising"],
      "mediaAssets": [
        { "url": "https://...jpg", "type": "IMAGE" }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

## Ingestion

The `NewsIngestorService` performs scheduled harvesting every 30 minutes using the configured feeds. You can also trigger `ingestAllSources()` manually if integrating with a controller or CLI command.
