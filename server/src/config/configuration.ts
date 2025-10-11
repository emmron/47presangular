export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  ingestion: {
    officialFeeds: (process.env.OFFICIAL_FEEDS ?? '')
      .split(',')
      .map((feed) => feed.trim())
      .filter((feed) => Boolean(feed)),
    licensedApis: [
      {
        name: 'newsapi',
        baseUrl: process.env.NEWS_API_URL ?? '',
        apiKey: process.env.NEWS_API_KEY ?? '',
        query: process.env.NEWS_API_QUERY ?? 'trump 2024 campaign',
      },
      {
        name: 'nyt',
        baseUrl: process.env.NYT_API_URL ?? '',
        apiKey: process.env.NYT_API_KEY ?? '',
        query: process.env.NYT_API_QUERY ?? 'trump 2024 campaign',
      },
    ],
    socialFeeds: (process.env.SOCIAL_FEEDS ?? '')
      .split(',')
      .map((feed) => feed.trim())
      .filter((feed) => Boolean(feed)),
  },
});
