const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { AnalyticsStore } = require('./analytics-store');
const { RecommendationEngine } = require('./recommendation-engine');
const { createAnalyticsMiddleware } = require('./analytics-middleware');

const PORT = process.env.PORT || 3000;

const app = express();
const analyticsStore = new AnalyticsStore();
const recommendationEngine = new RecommendationEngine(analyticsStore);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.context = {
    requestId: randomUUID(),
    receivedAt: new Date().toISOString()
  };
  next();
});

app.use('/api/analytics/events', createAnalyticsMiddleware(analyticsStore));

app.get('/api/news/recommended', (req, res) => {
  const userId = req.query.userId || req.headers['x-user-id'];
  const limit = Number(req.query.limit ?? 6);
  const recommendations = recommendationEngine.getRecommendations(userId, limit);
  res.json({
    requestedAt: new Date().toISOString(),
    userId: userId ?? null,
    ...recommendations
  });
});

app.get('/api/analytics/summary', (_req, res) => {
  const events = analyticsStore.getEvents();
  res.json({
    events,
    totals: {
      count: events.length
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Analytics and recommendation service listening on port ${PORT}`);
  });
}

module.exports = app;
