interface UnmatchedQueryPayload {
  hash: string;
  tokenCount: number;
  characterCount: number;
  [key: string]: unknown;
}

const hashFnv1a = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
};

const getUnmatchedPayload = (normalizedQuery: string): UnmatchedQueryPayload => ({
  hash: hashFnv1a(normalizedQuery),
  tokenCount: normalizedQuery.split(" ").filter(Boolean).length,
  characterCount: normalizedQuery.length,
});

export const logUnmatchedNormalizedSearchQuery = (normalizedQuery: string) => {
  if (typeof window === "undefined") return;
  if (!normalizedQuery.trim()) return;

  const payload = getUnmatchedPayload(normalizedQuery);
  const globalScope = window as unknown as {
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    analytics?: { track?: (eventName: string, payload?: Record<string, unknown>) => void };
  };

  if (typeof globalScope.plausible === "function") {
    globalScope.plausible("search_unmatched_normalized_query", { props: payload });
    return;
  }

  if (typeof globalScope.analytics?.track === "function") {
    globalScope.analytics.track("search_unmatched_normalized_query", payload);
  }
};
