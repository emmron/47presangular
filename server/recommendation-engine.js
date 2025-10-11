const path = require('path');
const fs = require('fs');
const { AnalyticsStore, EVENT_WEIGHTS } = require('./analytics-store');
const fallbackCohorts = require('./fallback-cohorts');

const CORPUS_FILE = path.join(__dirname, 'data', 'news-corpus.json');

function loadCorpus() {
  const raw = fs.readFileSync(CORPUS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function getEventWeight(type) {
  return EVENT_WEIGHTS[type] ?? 1;
}

function normalizeScores(scores) {
  const maxScore = Math.max(...scores.map(score => score.score), 1);
  return scores.map(entry => ({
    ...entry,
    score: entry.score / maxScore
  }));
}

class RecommendationEngine {
  constructor(store = new AnalyticsStore()) {
    this.store = store;
    this.corpus = loadCorpus();
  }

  refreshCorpus() {
    this.corpus = loadCorpus();
  }

  getCorpus() {
    return this.corpus;
  }

  buildUserProfile(userId) {
    const events = this.store.getEventsByUser(userId);
    if (!events.length) {
      return null;
    }

    const tagWeights = new Map();
    const itemEngagement = new Map();

    events.forEach(event => {
      const item = this.corpus.find(candidate => candidate.id === event.itemId);
      if (!item) {
        return;
      }
      const weight = getEventWeight(event.type);
      item.tags.forEach(tag => {
        const previous = tagWeights.get(tag) || 0;
        tagWeights.set(tag, previous + weight);
      });
      const currentItemEngagement = itemEngagement.get(item.id) || 0;
      itemEngagement.set(item.id, currentItemEngagement + weight);
    });

    return {
      tagWeights,
      itemEngagement
    };
  }

  computeContentScore(userProfile, item) {
    if (!userProfile) {
      return 0;
    }
    const { tagWeights } = userProfile;
    return item.tags.reduce((score, tag) => {
      return score + (tagWeights.get(tag) || 0);
    }, 0);
  }

  computeCollaborativeScore(userId, itemId) {
    const similarUsers = this.store.getSimilarUsers(userId).slice(0, 5);
    if (!similarUsers.length) {
      return 0;
    }

    let score = 0;
    similarUsers.forEach(user => {
      const events = this.store.getEventsByUser(user.id)
        .filter(event => event.itemId === itemId);
      const eventScore = events.reduce((acc, event) => acc + getEventWeight(event.type), 0);
      score += eventScore * user.score;
    });

    return score;
  }

  getPersonalizedRecommendations(userId, limit = 6) {
    const userProfile = this.buildUserProfile(userId);
    if (!userProfile) {
      return null;
    }

    const seenItems = new Set(this.store.getEventsByUser(userId).map(event => event.itemId));
    const scored = this.corpus.map(item => {
      const contentScore = this.computeContentScore(userProfile, item);
      const collaborativeScore = this.computeCollaborativeScore(userId, item.id);
      const popularityBoost = item.popularity * 0.1;
      const score = contentScore + collaborativeScore + popularityBoost;
      return { item, score, breakdown: { contentScore, collaborativeScore, popularityBoost } };
    })
      .filter(entry => !seenItems.has(entry.item.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      strategy: 'personalized',
      items: normalizeScores(scored).map(entry => ({
        ...entry.item,
        recommendationScore: Number(entry.score.toFixed(3)),
        breakdown: entry.breakdown
      }))
    };
  }

  getFallbackCohort(limit = 6) {
    const events = this.store.getEvents();
    const sharedCounts = this.store.getSharedCounts();

    const mostShared = Object.entries(sharedCounts)
      .map(([itemId, count]) => ({ itemId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(entry => this.corpus.find(item => item.id === entry.itemId))
      .filter(Boolean);

    if (mostShared.length) {
      return {
        strategy: 'fallback',
        cohort: fallbackCohorts[0],
        items: mostShared
      };
    }

    const fallback = fallbackCohorts[1];
    const curated = this.corpus
      .slice()
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return {
      strategy: 'fallback',
      cohort: fallback,
      items: curated
    };
  }

  getRecommendations(userId, limit = 6) {
    if (!userId) {
      const fallback = this.getFallbackCohort(limit);
      return { ...fallback, cohort: fallback.cohort ?? fallbackCohorts[2] };
    }

    const personalized = this.getPersonalizedRecommendations(userId, limit);
    if (personalized && personalized.items.length) {
      return personalized;
    }

    const fallback = this.getFallbackCohort(limit);
    if (!fallback.cohort) {
      fallback.cohort = fallbackCohorts[2];
    }
    return fallback;
  }
}

module.exports = {
  RecommendationEngine
};
