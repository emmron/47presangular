const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'news-topics.json');

const app = express();
app.use(cors());

function loadDataset() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function buildEventIndex(dataset) {
  return dataset.topics.flatMap(topic => {
    return topic.events.map(event => {
      const relatedItems = dataset.items.filter(item => {
        return item.eventSlug === event.slug && Array.isArray(item.topics) && item.topics.includes(topic.slug);
      });

      const averageMomentum = relatedItems.length
        ? relatedItems.reduce((total, item) => total + (item.momentumScore || 0), 0) / relatedItems.length
        : event.momentum;

      const sentimentBreakdown = relatedItems.reduce(
        (acc, item) => {
          const sentiment = item.sentiment || 'unknown';
          acc[sentiment] = (acc[sentiment] || 0) + 1;
          return acc;
        },
        {}
      );

      return {
        topic: topic.slug,
        topicTitle: topic.title,
        eventSlug: event.slug,
        title: event.title,
        date: event.date,
        description: event.description,
        declaredMomentum: event.momentum,
        relatedItemIds: event.relatedItemIds,
        averageMomentum,
        sentimentBreakdown,
        itemCount: relatedItems.length
      };
    });
  });
}

app.get('/api/news', (req, res) => {
  const dataset = loadDataset();
  const eventIndex = buildEventIndex(dataset);

  const topicFilter = req.query.topic;
  if (topicFilter) {
    const topic = dataset.topics.find(t => t.slug === topicFilter);
    if (!topic) {
      return res.status(404).json({ message: `Topic '${topicFilter}' not found` });
    }

    const items = dataset.items.filter(item => Array.isArray(item.topics) && item.topics.includes(topic.slug));
    const topicEvents = eventIndex.filter(event => event.topic === topic.slug);

    return res.json({
      lastUpdated: dataset.lastUpdated,
      topic,
      items,
      events: topicEvents
    });
  }

  res.json({
    lastUpdated: dataset.lastUpdated,
    topics: dataset.topics,
    items: dataset.items,
    events: eventIndex
  });
});

app.get('/api/topics/:slug', (req, res) => {
  const dataset = loadDataset();
  const slug = req.params.slug;
  const topic = dataset.topics.find(t => t.slug === slug);

  if (!topic) {
    return res.status(404).json({ message: `Topic '${slug}' not found` });
  }

  const eventIndex = buildEventIndex(dataset).filter(event => event.topic === slug);
  const items = dataset.items.filter(item => Array.isArray(item.topics) && item.topics.includes(slug));

  res.json({
    lastUpdated: dataset.lastUpdated,
    topic,
    items,
    events: eventIndex
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`News metadata service running on port ${port}`);
  });
}

module.exports = app;
