const fs = require('fs');
const path = require('path');

const ANALYTICS_FILE = path.join(__dirname, 'data', 'analytics-events.json');

const EVENT_WEIGHTS = {
  click: 1,
  save: 3,
  dwell: 0.5
};

function ensureStore() {
  if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.mkdirSync(path.dirname(ANALYTICS_FILE), { recursive: true });
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ events: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeStore(data) {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

class AnalyticsStore {
  constructor() {
    ensureStore();
  }

  recordEvent(event) {
    const store = readStore();
    const enriched = {
      ...event,
      weight: EVENT_WEIGHTS[event.type] ?? 1
    };
    store.events.push(enriched);
    writeStore(store);
    return enriched;
  }

  getEvents() {
    return readStore().events;
  }

  getEventsByUser(userId) {
    if (!userId) {
      return [];
    }
    return this.getEvents().filter(event => event.userId === userId);
  }

  getEngagementForItem(itemId) {
    return this.getEvents()
      .filter(event => event.itemId === itemId)
      .reduce((acc, event) => acc + (event.weight ?? 0), 0);
  }

  getSharedCounts() {
    return this.getEvents()
      .filter(event => event.type === 'save')
      .reduce((acc, event) => {
        acc[event.itemId] = (acc[event.itemId] || 0) + 1;
        return acc;
      }, {});
  }

  getSimilarUsers(userId) {
    const events = this.getEvents();
    const userEvents = events.filter(event => event.userId === userId);
    if (!userEvents.length) {
      return [];
    }

    const interactedItems = new Set(userEvents.map(event => event.itemId));
    const similarityScores = new Map();

    events.forEach(event => {
      if (event.userId === userId) {
        return;
      }
      if (interactedItems.has(event.itemId)) {
        const current = similarityScores.get(event.userId) || 0;
        similarityScores.set(event.userId, current + (event.weight ?? 1));
      }
    });

    return Array.from(similarityScores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
  }
}

module.exports = {
  AnalyticsStore,
  EVENT_WEIGHTS
};
