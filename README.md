# AussieCricketPulse

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Aggregated news backend

The Angular client now delegates all third-party API requests to a NestJS service located under [`server/`](server/). Start it locally with:

```bash
cd server
npm install
npm run start:dev
```

The server listens on port `3000` by default and exposes the following endpoints:

| Endpoint | Description |
| --- | --- |
| `GET /api/news` | Returns a deduplicated and chronologically sorted list of aggregated `NewsItem` payloads. Pass `?refresh=true` to bypass cached responses. |
| `GET /api/health` | Lightweight health check that verifies the cache can be read and reports the latest article timestamp. |

### Configuration

The service uses rate-limit aware scheduling, retries, and cache invalidation to avoid throttling Reddit, NewsAPI, and NYTimes. Configuration is driven via environment variables (place them in a `.env` file inside `server/` for local development):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port for the Nest server. |
| `NEWSAPI_KEY` | _required for NewsAPI_ | API key issued by [NewsAPI.org](https://newsapi.org). When omitted the source is skipped. |
| `NYTIMES_API_KEY` | _required for NYTimes_ | API key issued by the New York Times. When omitted the source is skipped. |
| `NEWS_CACHE_TTL_SECONDS` | `300` | TTL for the aggregated news payload stored in cache. |
| `NEWS_RETRY_COUNT` | `2` | Number of retry attempts per upstream request when a transient error occurs. |
| `NEWS_REFRESH_INTERVAL_MS` | `300000` | Interval for the scheduled background refresh (honors upstream rate limits). |
| `CACHE_REDIS_URL` | _unset_ | When provided the service caches responses in Redis instead of memory. Example: `redis://localhost:6379/0`. |
| `CACHE_POSTGRES_URL` | _unset_ | When provided (and Redis is not configured) the service uses Postgres for caching. Example: `postgres://user:pass@localhost:5432/news`. |

If both Redis and Postgres are omitted the application falls back to an in-memory cache (suitable for development only). When using Postgres ensure the connected user can create the `news_cache` table.

### Monitoring & health checks

* Use `GET /api/health` for container or uptime monitoring.
* The scheduler logs refresh attempts and failures; pair this with your observability stack (e.g. Fluent Bit, CloudWatch) to alert on degraded fetches.
* Wrap `npm run start:dev` or `npm run start` with your preferred process manager (PM2, systemd, etc.) for production restarts.

### Front-end integration

The Angular app consumes the backend at `/api/news`. Configure your dev proxy (e.g. `ng serve --proxy-config proxy.conf.json`) or reverse proxy (Nginx, Netlify functions) to forward `/api/*` to the Node service in production environments.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deployment

Pushing to the `main` branch automatically builds and publishes the static site to GitHub Pages. The [`deploy.yml`](.github/workflows/deploy.yml) workflow handles the build and deployment steps:

1. Installs dependencies with `npm ci` using Node.js 20.
2. Builds the Angular app with a repository-aware `base-href` so assets resolve correctly at `https://<user>.github.io/<repo>/`.
3. Uploads `dist/trump-tracker/browser` as the static artifact and deploys it to GitHub Pages.

After the first successful run, enable GitHub Pages in the repository settings and choose the "GitHub Actions" source. Subsequent pushes to `main` will update the live site automatically.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
