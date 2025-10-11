import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const polls = [
  {
    id: 'gop-primary-confidence',
    question: 'How confident are you that Trump will secure the GOP nomination?',
    options: [
      { id: 'very-confident', label: 'Very confident', votes: 4871 },
      { id: 'somewhat-confident', label: 'Somewhat confident', votes: 1984 },
      { id: 'not-confident', label: 'Not confident', votes: 763 }
    ],
    lastUpdated: new Date('2024-03-21T14:00:00Z').toISOString()
  },
  {
    id: 'general-election-outlook',
    question: 'What is your outlook on Trump in the general election?',
    options: [
      { id: 'win', label: 'Likely win', votes: 3120 },
      { id: 'tossup', label: 'Too close to call', votes: 2795 },
      { id: 'loss', label: 'Likely loss', votes: 2145 }
    ],
    lastUpdated: new Date('2024-03-20T17:30:00Z').toISOString()
  }
];

const analyticsEvents = [];
const newsletterSignups = [];

function summarizePoll(poll) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  return {
    ...poll,
    totalVotes,
    options: poll.options.map(option => ({
      ...option,
      percentage: totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0
    }))
  };
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/polls', (_req, res) => {
  res.json({ polls: polls.map(summarizePoll) });
});

app.post('/polls/:id/vote', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  const { optionId } = req.body || {};
  const option = poll.options.find(o => o.id === optionId);
  if (!option) {
    return res.status(400).json({ message: 'Invalid option' });
  }
  option.votes += 1;
  poll.lastUpdated = new Date().toISOString();
  analyticsEvents.push({
    type: 'poll_vote',
    timestamp: new Date().toISOString(),
    pollId: poll.id,
    optionId
  });
  res.json({ poll: summarizePoll(poll) });
});

app.post('/newsletter/signup', (req, res) => {
  const { email, storyId } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const record = {
    email,
    storyId: storyId || null,
    timestamp: new Date().toISOString()
  };
  newsletterSignups.push(record);
  analyticsEvents.push({
    type: 'newsletter_signup',
    timestamp: record.timestamp,
    storyId: record.storyId,
    emailHash: Buffer.from(email).toString('base64')
  });
  res.status(201).json({ message: 'Thanks for signing up!' });
});

app.post('/analytics/events', (req, res) => {
  const { eventName, payload } = req.body || {};
  if (!eventName) {
    return res.status(400).json({ message: 'eventName is required' });
  }
  analyticsEvents.push({
    type: eventName,
    payload: payload || {},
    timestamp: new Date().toISOString()
  });
  res.status(202).json({ status: 'queued' });
});

app.get('/analytics/events', (_req, res) => {
  const summary = analyticsEvents.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {});
  res.json({ totalEvents: analyticsEvents.length, summary });
});

app.get('/og-image', (req, res) => {
  const title = (req.query.title || 'Trump 47 Campaign Update').toString();
  const source = (req.query.source || 'Campaign Tracker').toString();
  const date = (req.query.date || new Date().toISOString()).toString();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="rgba(15, 23, 42, 0.4)" />
      </filter>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <g filter="url(#shadow)">
      <rect x="80" y="120" width="1040" height="360" rx="32" fill="rgba(15, 23, 42, 0.65)" stroke="rgba(255,255,255,0.25)" stroke-width="2" />
    </g>
    <text x="110" y="220" fill="#93c5fd" font-family="'Inter', sans-serif" font-size="42" font-weight="600">${source}</text>
    <foreignObject x="110" y="250" width="980" height="200">
      <div xmlns="http://www.w3.org/1999/xhtml" style="color:#f8fafc;font-family:'Inter',sans-serif;font-size:64px;font-weight:700;line-height:1.1;">
        ${title.replace(/&/g, '&amp;')}
      </div>
    </foreignObject>
    <text x="110" y="520" fill="#bfdbfe" font-family="'Inter', sans-serif" font-size="32">${new Date(date).toLocaleString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })} • ${new Date(date).toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })} UTC</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

app.listen(port, () => {
  console.log(`Engagement service listening on port ${port}`);
});
