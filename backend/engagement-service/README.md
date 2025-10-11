# Engagement Service

This lightweight Express service powers the front-end engagement features:

- Provides curated poll/survey results via `/polls`
- Captures newsletter signups at `/newsletter/signup`
- Accepts analytics events at `/analytics/events`
- Generates dynamic OpenGraph preview images through `/og-image`

## Getting Started

```bash
cd backend/engagement-service
npm install
npm start
```

The server listens on `http://localhost:4000` by default. Update the Angular application's environment configuration or service constants if you change the port.

### API Overview

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `GET` | `/health` | Health check returning `{ status: 'ok' }`. |
| `GET` | `/polls` | Returns poll questions with aggregated vote counts and percentages. |
| `POST` | `/polls/:id/vote` | Increment a poll option and log an analytics event. |
| `POST` | `/newsletter/signup` | Record a newsletter signup for downstream processing. |
| `POST` | `/analytics/events` | Store social share, conversion, or other engagement events. |
| `GET` | `/analytics/events` | Summarize stored analytics events. |
| `GET` | `/og-image` | Returns an SVG social preview image. Pass `title`, `source`, and `date` query params. |

The data is stored in memory for simplicity; integrate a persistent store or external service as needed for production.
