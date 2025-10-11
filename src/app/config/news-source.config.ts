import type { HttpHeaders, HttpParams } from '@angular/common/http';

export interface ProxyEndpointConfig {
  url: string;
  headers?: HttpHeaders;
  params?: HttpParams | Record<string, string | number | boolean>;
}

export interface NewsSourceProxyConfig {
  newsApi: ProxyEndpointConfig;
  nyTimes: ProxyEndpointConfig;
  fecFilings: ProxyEndpointConfig;
  campaignRss: ProxyEndpointConfig;
  twitter: ProxyEndpointConfig;
}

export interface NewsAggregationConfig {
  proxies: NewsSourceProxyConfig;
  cacheTtlMs: number;
  relevance: {
    recencyHalfLifeHours: number;
    keywordBoost: Record<string, number>;
  };
  defaultQuery: string;
}

const defaultConfig: NewsAggregationConfig = {
  proxies: {
    newsApi: {
      url: '/api/news/newsapi',
      params: {
        language: 'en',
        pageSize: 50
      }
    },
    nyTimes: {
      url: '/api/news/nytimes',
      params: {
        sort: 'newest'
      }
    },
    fecFilings: {
      url: '/api/news/fec',
      params: {
        per_page: 50
      }
    },
    campaignRss: {
      url: '/api/news/rss'
    },
    twitter: {
      url: '/api/news/twitter',
      params: {
        limit: 50
      }
    }
  },
  cacheTtlMs: 10 * 60 * 1000,
  relevance: {
    recencyHalfLifeHours: 6,
    keywordBoost: {
      election: 2,
      fundraising: 1.5,
      polling: 1.25,
      rally: 1.15
    }
  },
  defaultQuery: 'trump 2024 campaign'
};

function readRuntimeConfig(): Partial<NewsAggregationConfig> | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }
  const runtimeConfig = (globalThis as any).__NEWS_AGGREGATION_CONFIG__;
  if (!runtimeConfig || typeof runtimeConfig !== 'object') {
    return undefined;
  }
  return runtimeConfig as Partial<NewsAggregationConfig>;
}

function mergeProxyConfig(defaultProxy: ProxyEndpointConfig, override?: Partial<ProxyEndpointConfig>): ProxyEndpointConfig {
  if (!override) {
    return defaultProxy;
  }
  const params = override.params
    ? { ...((defaultProxy.params as Record<string, any>) ?? {}), ...(override.params as Record<string, any>) }
    : defaultProxy.params;

  return {
    ...defaultProxy,
    ...override,
    params
  };
}

export const newsAggregationConfig: NewsAggregationConfig = (() => {
  const runtimeConfig = readRuntimeConfig();
  if (!runtimeConfig) {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...runtimeConfig,
    proxies: {
      newsApi: mergeProxyConfig(defaultConfig.proxies.newsApi, runtimeConfig.proxies?.newsApi),
      nyTimes: mergeProxyConfig(defaultConfig.proxies.nyTimes, runtimeConfig.proxies?.nyTimes),
      fecFilings: mergeProxyConfig(defaultConfig.proxies.fecFilings, runtimeConfig.proxies?.fecFilings),
      campaignRss: mergeProxyConfig(defaultConfig.proxies.campaignRss, runtimeConfig.proxies?.campaignRss),
      twitter: mergeProxyConfig(defaultConfig.proxies.twitter, runtimeConfig.proxies?.twitter)
    }
  };
})();
