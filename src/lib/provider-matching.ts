import type { Provider } from "@/data/marketplace";
import { getLegacyCategoryTaxonomyMapping } from "@/lib/legacy-taxonomy-compat";
import type { CanonicalWorkTypeSlug } from "@/lib/taxonomy";

export interface ProviderMatchRequest {
  stageId?: number;
  disciplineId?: number;
  serviceId?: number;
  workTypeId?: number;
  workTypeCode?: CanonicalWorkTypeSlug | string;
  location?: string;
}

export interface ProviderMatchSignals {
  exactServiceMatch: boolean;
  disciplineMatch: boolean;
  stageMatch: boolean;
  workTypeMatch: boolean;
  locationCoverage: boolean;
  verificationPresence: boolean;
  portfolioPresence: boolean;
  recentActivity: boolean;
}

export interface ProviderMatchResult {
  provider: Provider;
  score: number;
  signals: ProviderMatchSignals;
  reasons: string[];
}

export const MATCH_WEIGHTS = {
  exactServiceMatch: 40,
  disciplineMatch: 20,
  stageMatch: 15,
  workTypeMatch: 10,
  locationCoverage: 15,
  verificationPresence: 8,
  portfolioPresence: 6,
  recentActivity: 4,
} as const;

const normalize = (value: string) => value.trim().toLowerCase();

const hasLocationCoverage = (provider: Provider, location?: string): boolean => {
  if (!location?.trim()) return false;
  const needle = normalize(location);
  const haystack = normalize(`${provider.city} ${provider.location} ${provider.serviceAreas.join(" ")}`);
  return haystack.includes(needle);
};

const hasPortfolioPresence = (provider: Provider): boolean =>
  (provider.portfolioImages?.length ?? 0) > 0 || (provider.portfolioProjects?.length ?? 0) > 0;

const getSignals = (provider: Provider, request: ProviderMatchRequest): ProviderMatchSignals => {
  const serviceIds = new Set(provider.serviceIds ?? []);
  const workTypeIds = new Set(provider.workTypeIds ?? []);
  const fallbackWorkTypeCode = getLegacyCategoryTaxonomyMapping(provider.categorySlug)?.workTypeSlug;

  const exactServiceMatch = Boolean(
    request.serviceId &&
      (provider.primaryServiceId === request.serviceId || serviceIds.has(request.serviceId)),
  );

  const disciplineMatch = Boolean(
    request.disciplineId && provider.primaryDisciplineId === request.disciplineId,
  );

  const stageMatch = Boolean(request.stageId && provider.phaseId === request.stageId);

  const workTypeMatch = Boolean(
    (request.workTypeId && workTypeIds.has(request.workTypeId)) ||
      (request.workTypeCode && fallbackWorkTypeCode === request.workTypeCode),
  );

  const verificationPresence = Boolean(provider.trustSnapshot?.providerVerified || provider.verified);
  const portfolioPresence = hasPortfolioPresence(provider);
  const recentActivity = Boolean(provider.trustSnapshot?.activeThisMonth);

  return {
    exactServiceMatch,
    disciplineMatch,
    stageMatch,
    workTypeMatch,
    locationCoverage: hasLocationCoverage(provider, request.location),
    verificationPresence,
    portfolioPresence,
    recentActivity,
  };
};

const getScore = (signals: ProviderMatchSignals): number =>
  Object.entries(signals).reduce((total, [key, matched]) => {
    if (!matched) return total;
    return total + MATCH_WEIGHTS[key as keyof typeof MATCH_WEIGHTS];
  }, 0);

const getReasons = (signals: ProviderMatchSignals): string[] => {
  const reasons: string[] = [];
  if (signals.exactServiceMatch) reasons.push("ofrece este servicio");
  if (signals.disciplineMatch) reasons.push("coincide con la disciplina");
  if (signals.stageMatch) reasons.push("trabaja en esta etapa");
  if (signals.workTypeMatch) reasons.push("maneja este tipo de obra");
  if (signals.locationCoverage) reasons.push("trabaja en tu zona");
  if (signals.verificationPresence) reasons.push("perfil revisado");
  if (signals.portfolioPresence) reasons.push("tiene portafolio");
  if (signals.recentActivity) reasons.push("activo recientemente");
  return reasons;
};

export const matchProvidersDeterministic = (
  providers: Provider[],
  request: ProviderMatchRequest,
): ProviderMatchResult[] => {
  const results = providers.map((provider) => {
    const signals = getSignals(provider, request);
    return {
      provider,
      signals,
      score: getScore(signals),
      reasons: getReasons(signals),
    };
  });

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    // Monetization coexistence rule: featured only as a tie-breaker after relevance score.
    if (Boolean(b.provider.isFeatured) !== Boolean(a.provider.isFeatured)) {
      return Number(Boolean(b.provider.isFeatured)) - Number(Boolean(a.provider.isFeatured));
    }

    if (b.provider.rating !== a.provider.rating) return b.provider.rating - a.provider.rating;
    if (b.provider.completedProjects !== a.provider.completedProjects) {
      return b.provider.completedProjects - a.provider.completedProjects;
    }
    return a.provider.name.localeCompare(b.provider.name, "es");
  });

  return results;
};
