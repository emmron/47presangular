const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const Parser = require('rss-parser');

const app = express();
const PORT = process.env.PORT || 4000;
const API_PREFIX = '/api';

app.use(cors());
app.use(express.json());

const users = new Map();
const sessions = new Map();
const digestJobs = new Map();

const OZB_FEED_URL = 'https://www.ozbargain.com.au/deals/feed';
const DEAL_CACHE_TTL_MS = 1000 * 60 * 5;

const rssParser = new Parser({
  customFields: {
    item: [
      ['ozb:meta', 'ozbMeta'],
      ['media:thumbnail', 'mediaThumbnail']
    ]
  }
});

let cachedDealsSnapshot = null;

function getUserRecord(userId) {
  const record = users.get(userId);
  if (!record) {
    throw new Error('User not found');
  }
  return record;
}

function serializeFiltersForResponse(filters) {
  const clone = { ...filters };
  if (clone.dateFrom instanceof Date) {
    clone.dateFrom = clone.dateFrom.toISOString();
  }
  if (clone.dateTo instanceof Date) {
    clone.dateTo = clone.dateTo.toISOString();
  }
  return clone;
}

function summarizeFilters(filters) {
  const parts = [];
  if (filters.source) {
    parts.push(`source: ${filters.source}`);
  }
  if (filters.category) {
    parts.push(`category: ${filters.category}`);
  }
  if (filters.dateFrom) {
    parts.push(`from ${filters.dateFrom}`);
  }
  if (filters.dateTo) {
    parts.push(`to ${filters.dateTo}`);
  }
  if (filters.searchTerm) {
    parts.push(`search '${filters.searchTerm}'`);
  }
  return parts.length ? parts.join(', ') : 'no filters applied';
}

function composeDigestSummary(user) {
  const { filterPresets = [] } = user;
  if (!filterPresets.length) {
    return 'No saved briefings yet. Add a filter preset to receive tailored digests.';
  }

  const summaryLines = filterPresets.map((preset) => {
    const description = summarizeFilters(preset.filters);
    return `• ${preset.name}: ${description}`;
  });

  return [
    `Personalized digest for ${user.displayName || user.email}`,
    '',
    ...summaryLines
  ].join('\n');
}

function toCronExpression(frequency, timeOfDay) {
  const [hour, minute] = timeOfDay.split(':').map((value) => parseInt(value, 10));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error('Invalid time of day provided');
  }

  switch (frequency) {
    case 'daily':
      return `${minute} ${hour} * * *`;
    case 'weekly':
      return `${minute} ${hour} * * 1`;
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
}

function scheduleDigestJob(userId) {
  const user = getUserRecord(userId);
  const digest = user.digestSchedule;

  if (!digest?.enabled) {
    if (digestJobs.has(userId)) {
      digestJobs.get(userId).stop();
      digestJobs.delete(userId);
    }
    return;
  }

  const cronExpression = toCronExpression(digest.frequency, digest.timeOfDay);

  if (digestJobs.has(userId)) {
    const existing = digestJobs.get(userId);
    existing.stop();
    digestJobs.delete(userId);
  }

  const job = cron.schedule(cronExpression, () => {
    const record = getUserRecord(userId);
    const summary = composeDigestSummary(record);
    const generatedAt = new Date().toISOString();

    record.digestHistory.unshift({
      id: uuidv4(),
      generatedAt,
      summary
    });

    record.digestSchedule.lastRunAt = generatedAt;

    try {
      const next = job.nextDates().toDate();
      record.digestSchedule.nextRunAt = next.toISOString();
    } catch (err) {
      record.digestSchedule.nextRunAt = null;
    }
  }, {
    scheduled: true,
    timezone: digest.timezone || 'UTC'
  });

  try {
    const next = job.nextDates().toDate();
    digest.nextRunAt = next.toISOString();
  } catch (err) {
    digest.nextRunAt = null;
  }

  digestJobs.set(userId, job);
}

function issueSession(userId) {
  const token = uuidv4();
  sessions.set(token, userId);
  return token;
}

function findUserBySession(token) {
  const userId = sessions.get(token);
  if (!userId) {
    return null;
  }
  return users.get(userId) || null;
}

function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  const user = findUserBySession(token);

  if (!user) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }

  req.user = user;
  req.token = token;
  return next();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    provider: user.provider,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Identity and personalization service running' });
});

app.post(`${API_PREFIX}/auth/email`, (req, res) => {
  const { email, displayName } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: 'Email is required for email sign in' });
  }

  const normalizedEmail = String(email).toLowerCase();
  let user = Array.from(users.values()).find((record) => record.email === normalizedEmail);

  if (!user) {
    const userId = uuidv4();
    user = {
      id: userId,
      email: normalizedEmail,
      displayName: displayName || normalizedEmail,
      provider: 'email',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filterPresets: [],
      digestSchedule: null,
      digestHistory: []
    };
    users.set(userId, user);
  } else {
    user.displayName = displayName || user.displayName;
    user.updatedAt = new Date().toISOString();
  }

  const token = issueSession(user.id);

  return res.json({
    token,
    user: sanitizeUser(user)
  });
});

app.post(`${API_PREFIX}/auth/social`, (req, res) => {
  const { provider, externalToken, email, displayName } = req.body || {};

  if (!provider || !externalToken) {
    return res.status(400).json({ message: 'Provider and external token are required for social sign in' });
  }

  const normalizedProvider = String(provider).toLowerCase();
  const normalizedEmail = email ? String(email).toLowerCase() : undefined;

  let user = null;

  if (normalizedEmail) {
    user = Array.from(users.values()).find((record) => record.email === normalizedEmail);
  }

  if (!user) {
    const userId = uuidv4();
    user = {
      id: userId,
      email: normalizedEmail,
      displayName: displayName || normalizedProvider,
      provider: normalizedProvider,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filterPresets: [],
      digestSchedule: null,
      digestHistory: []
    };
    users.set(userId, user);
  } else {
    user.provider = normalizedProvider;
    user.displayName = displayName || user.displayName;
    user.updatedAt = new Date().toISOString();
  }

  const token = issueSession(user.id);
  return res.json({
    token,
    user: sanitizeUser(user)
  });
});

app.use(`${API_PREFIX}/users/:userId`, requireAuth, (req, res, next) => {
  const { userId } = req.params;
  if (req.user.id !== userId) {
    return res.status(403).json({ message: 'You are not authorized to access this user resource' });
  }
  return next();
});

app.get(`${API_PREFIX}/users/:userId/filters`, (req, res) => {
  const user = req.user;
  const presets = (user.filterPresets || []).map((preset) => ({
    ...preset,
    filters: serializeFiltersForResponse(preset.filters)
  }));
  res.json({ presets });
});

app.post(`${API_PREFIX}/users/:userId/filters`, (req, res) => {
  const user = req.user;
  const { name, filters } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'Preset name is required' });
  }

  const preset = {
    id: uuidv4(),
    name: String(name),
    filters: filters || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  user.filterPresets = user.filterPresets || [];
  user.filterPresets.push(preset);
  user.updatedAt = new Date().toISOString();

  return res.status(201).json({
    preset: {
      ...preset,
      filters: serializeFiltersForResponse(preset.filters)
    }
  });
});

app.delete(`${API_PREFIX}/users/:userId/filters/:presetId`, (req, res) => {
  const user = req.user;
  const { presetId } = req.params;

  user.filterPresets = (user.filterPresets || []).filter((preset) => preset.id !== presetId);
  user.updatedAt = new Date().toISOString();

  res.status(204).send();
});

app.get(`${API_PREFIX}/users/:userId/digest`, (req, res) => {
  const user = req.user;
  res.json({
    schedule: user.digestSchedule,
    history: user.digestHistory?.slice(0, 20) || []
  });
});

app.post(`${API_PREFIX}/users/:userId/digest`, (req, res) => {
  const user = req.user;
  const { frequency, timeOfDay, timezone } = req.body || {};

  if (!frequency || !timeOfDay) {
    return res.status(400).json({ message: 'Frequency and time of day are required for scheduling a digest' });
  }

  user.digestSchedule = {
    enabled: true,
    frequency,
    timeOfDay,
    timezone: timezone || 'UTC',
    lastRunAt: user.digestSchedule?.lastRunAt || null,
    nextRunAt: null
  };

  scheduleDigestJob(user.id);

  res.json({ schedule: user.digestSchedule });
});

app.delete(`${API_PREFIX}/users/:userId/digest`, (req, res) => {
  const user = req.user;

  if (digestJobs.has(user.id)) {
    digestJobs.get(user.id).stop();
    digestJobs.delete(user.id);
  }

  user.digestSchedule = null;
  res.status(204).send();
});

app.post(`${API_PREFIX}/users/:userId/digest/test`, (req, res) => {
  const user = req.user;
  const summary = composeDigestSummary(user);
  const generatedAt = new Date().toISOString();
  user.digestHistory = user.digestHistory || [];
  user.digestHistory.unshift({
    id: uuidv4(),
    generatedAt,
    summary,
    test: true
  });
  res.json({ generatedAt, summary });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled server error', err);
  res.status(500).json({ message: 'Unexpected server error', details: err.message });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Identity and personalization service listening on port ${PORT}`);
});
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'news-topics.json');

const app = express();
app.use(cors());

app.get('/api/deals/latest', async (req, res) => {
  try {
    const forceRefresh = req.query.force === 'true';
    const limitParam = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : null;

    const payload = await getLatestDeals({ forceRefresh, limit });

    res.json({
      fetchedAt: payload.fetchedAt,
      source: payload.source,
      totalDeals: payload.totalDeals,
      deals: payload.deals,
      cacheAgeMs: payload.cacheAgeMs,
      cacheTtlMs: DEAL_CACHE_TTL_MS
    });
  } catch (error) {
    console.error('Failed to refresh OzBargain feed', error);
    res.status(502).json({
      message: 'Failed to load OzBargain feed.',
      detail: error.message
    });
  }
});

async function getLatestDeals(options = {}) {
  const { forceRefresh = false, limit = null } = options;
  const snapshot = await loadOzbargainSnapshot(forceRefresh);
  const deals = limit ? snapshot.deals.slice(0, limit) : snapshot.deals;

  return {
    fetchedAt: snapshot.fetchedAt,
    source: snapshot.source,
    totalDeals: snapshot.deals.length,
    deals,
    cacheAgeMs: Date.now() - snapshot.timestamp
  };
}

async function loadOzbargainSnapshot(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cachedDealsSnapshot && now - cachedDealsSnapshot.timestamp < DEAL_CACHE_TTL_MS) {
    return cachedDealsSnapshot;
  }

  const feed = await rssParser.parseURL(OZB_FEED_URL);
  const deals = Array.isArray(feed.items)
    ? feed.items
        .map((item, index) => mapOzbargainItem(item, index))
        .filter((deal) => deal !== null)
    : [];

  const snapshot = {
    timestamp: now,
    fetchedAt: new Date(now).toISOString(),
    source: OZB_FEED_URL,
    deals
  };

  cachedDealsSnapshot = snapshot;
  return snapshot;
}

function mapOzbargainItem(item, index) {
  if (!item || !item.title || !item.link) {
    return null;
  }

  const meta = item.ozbMeta && item.ozbMeta.$ ? item.ozbMeta.$ : {};
  const categories = Array.isArray(item.categories)
    ? item.categories
        .filter((value) => typeof value === 'string')
        .map((value) => decodeHtmlEntities(value).trim())
        .filter(Boolean)
    : [];
  const summary = extractSummaryText(item.content || item.contentSnippet || '');
  const priceLabel = extractPriceFromTitle(item.title);
  const priceValue = priceLabel ? parsePriceValue(priceLabel) : undefined;
  const store = extractStoreName(item.title, summary);
  const positiveVotes = coerceInteger(meta['votes-pos']);
  const negativeVotes = coerceInteger(meta['votes-neg']);
  const commentCount = coerceInteger(meta['comment-count']);
  const clickCount = coerceInteger(meta['click-count']);
  const externalUrl = typeof meta.url === 'string' ? meta.url : undefined;
  const thumbnail =
    typeof meta.image === 'string'
      ? meta.image
      : item.mediaThumbnail?.$?.url || undefined;

  return {
    id: deriveItemId(item, index),
    title: decodeHtmlEntities(item.title).trim(),
    link: item.link,
    author: decodeHtmlEntities(item.creator || item['dc:creator'] || 'Community Scout'),
    postedAt: deriveIsoDate(item.isoDate || item.pubDate),
    thumbnail,
    categories,
    summary,
    priceLabel: priceLabel || undefined,
    priceValue,
    store,
    commentCount,
    clickCount,
    positiveVotes,
    negativeVotes,
    externalUrl,
    score: positiveVotes - negativeVotes
  };
}

function deriveItemId(item, index) {
  if (typeof item.guid === 'string' && item.guid.trim().length) {
    return item.guid.split(' ')[0];
  }

  if (typeof item.id === 'string' && item.id.trim().length) {
    return item.id.trim();
  }

  if (typeof item.link === 'string' && item.link.trim().length) {
    return item.link.split('/').pop();
  }

  return `${index}`;
}

function deriveIsoDate(value) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function decodeHtmlEntities(input) {
  if (typeof input !== 'string') {
    return '';
  }

  const entities = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  };

  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    })
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] || match);
}

function extractSummaryText(html) {
  const withoutTags = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return decodeHtmlEntities(withoutTags);
}

function extractPriceFromTitle(title) {
  if (typeof title !== 'string') {
    return undefined;
  }

  const priceMatch = title.match(/\$\d+[\d,.]*/);
  return priceMatch ? priceMatch[0] : undefined;
}

function parsePriceValue(priceLabel) {
  if (typeof priceLabel !== 'string') {
    return undefined;
  }

  const normalized = priceLabel.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function extractStoreName(title, summary) {
  if (typeof title === 'string') {
    const atMatch = title.match(/@\s*([^|\-\[]+)/);
    if (atMatch) {
      return atMatch[1].trim();
    }
  }

  if (typeof summary === 'string') {
    const fromSummary = summary.match(/@[\s]*([A-Za-z0-9 &'-]+)/);
    if (fromSummary) {
      return fromSummary[1].trim();
    }
  }

  return undefined;
}

function coerceInteger(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

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
