// JustWatch API client
// Note: JustWatch doesn't have an official public API, so we'll use their website structure
// and TMDB's watch/providers endpoint as a fallback

export interface JustWatchProvider {
  id: number;
  name: string; // サービス名のみ利用。ロゴは今は使わない。
  // logoUrl?: string; // 将来的にロゴを追加したい場合はこのプロパティを利用
  type: 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';
}

export interface JustWatchMovie {
  id: string;
  title: string;
  providers: JustWatchProvider[];
  justWatchUrl: string;
}

// Get JustWatch URL for a movie
export function getJustWatchUrl(movieTitle: string, movieYear?: number): string {
  // Create a more specific search query for better results
  const searchQuery = encodeURIComponent(`${movieTitle} ${movieYear || ''}`.trim());
  return `https://www.justwatch.com/us/search?q=${searchQuery}`;
}

// Get JustWatch movie detail URL (if we can construct it)
export function getJustWatchMovieUrl(movieTitle: string, movieYear?: number): string {
  // JustWatch doesn't have a predictable URL structure, so we'll use search
  // In a real implementation, you might want to use their API or scrape the search results
  const searchQuery = encodeURIComponent(`${movieTitle} ${movieYear || ''}`.trim());
  return `https://www.justwatch.com/us/search?q=${searchQuery}`;
}

// Get provider-specific JustWatch URL
export function getProviderJustWatchUrl(movieTitle: string, providerName: string, movieYear?: number): string {
  const searchQuery = encodeURIComponent(`${movieTitle} ${movieYear || ''} ${providerName}`.trim());
  return `https://www.justwatch.com/us/search?q=${searchQuery}`;
}

// Get provider logo URL
// 今はロゴを使わないので未使用。将来的にロゴを追加したい場合はこの関数を利用。
// export function getProviderLogoUrl(providerName: string): string { ... }

// Transform TMDB watch providers to JustWatch format
export function transformWatchProviders(tmdbProviders: any): JustWatchProvider[] {
  if (!tmdbProviders) return [];
  
  const providers: JustWatchProvider[] = [];
  
  // Add flatrate (subscription) providers
  if (tmdbProviders.flatrate) {
    tmdbProviders.flatrate.forEach((provider: any) => {
      providers.push({
        id: provider.provider_id,
        name: provider.provider_name,
        // logoUrl: '', // 今はロゴを使わない
        type: 'flatrate'
      });
    });
  }
  
  // Add free providers
  if (tmdbProviders.free) {
    tmdbProviders.free.forEach((provider: any) => {
      providers.push({
        id: provider.provider_id,
        name: provider.provider_name,
        // logoUrl: '', // 今はロゴを使わない
        type: 'free'
      });
    });
  }
  
  // Add ad-supported providers
  if (tmdbProviders.ads) {
    tmdbProviders.ads.forEach((provider: any) => {
      providers.push({
        id: provider.provider_id,
        name: provider.provider_name,
        // logoUrl: '', // 今はロゴを使わない
        type: 'ads'
      });
    });
  }
  
  // Add rent providers
  if (tmdbProviders.rent) {
    tmdbProviders.rent.forEach((provider: any) => {
      providers.push({
        id: provider.provider_id,
        name: provider.provider_name,
        // logoUrl: '', // 今はロゴを使わない
        type: 'rent'
      });
    });
  }
  
  // Add buy providers
  if (tmdbProviders.buy) {
    tmdbProviders.buy.forEach((provider: any) => {
      providers.push({
        id: provider.provider_id,
        name: provider.provider_name,
        // logoUrl: '', // 今はロゴを使わない
        type: 'buy'
      });
    });
  }
  
  return providers;
} 