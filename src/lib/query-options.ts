export const QUERY_STALE_TIMES = {
  short: 60_000,
  list: 5 * 60_000,
  catalog: 30 * 60_000,
} as const;

export const MARKETPLACE_LIST_QUERY_OPTIONS = {
  staleTime: QUERY_STALE_TIMES.list,
  gcTime: 60 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export const CATALOG_QUERY_OPTIONS = {
  staleTime: QUERY_STALE_TIMES.catalog,
  gcTime: 2 * 60 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;
