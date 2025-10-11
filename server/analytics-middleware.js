const { randomUUID } = require('crypto');

function createAnalyticsMiddleware(store) {
  return function analyticsMiddleware(req, res, next) {
    if (req.method !== 'POST') {
      return next();
    }

    const { type, itemId, dwellTimeMs, userId, metadata } = req.body ?? {};
    if (!type || !itemId) {
      return res.status(400).json({ message: 'Missing required fields: type and itemId' });
    }

    const resolvedUserId = userId || req.headers['x-user-id'] || 'anonymous';
    const event = store.recordEvent({
      id: randomUUID(),
      type,
      itemId,
      userId: resolvedUserId,
      dwellTimeMs: dwellTimeMs ?? null,
      metadata: {
        requestId: req.context?.requestId,
        ...metadata
      },
      recordedAt: new Date().toISOString()
    });

    res.status(201).json({ status: 'recorded', event });
  };
}

module.exports = {
  createAnalyticsMiddleware
};
