import type { Provider } from "@/data/marketplace";

export type TrustBadgeType = "verified" | "active" | "registered_project";

interface ProviderActivityContext {
  profileCompleteness?: number;
  hasRecentLeadActivity?: boolean;
  hasRecentNotificationActivity?: boolean;
}

export const calculateProviderProfileCompleteness = (provider: Provider | null | undefined): number => {
  if (!provider) return 0;

  const checks = [
    Boolean(provider.name.trim()),
    Boolean(provider.trade.trim()),
    provider.phaseId > 0,
    Boolean(provider.categorySlug.trim()),
    Boolean(provider.city.trim()),
    Boolean(provider.location.trim()),
    provider.yearsExperience > 0,
    Boolean(provider.whatsapp.trim()),
    Boolean(provider.description.trim()),
    provider.serviceAreas.length > 0,
    provider.portfolioImages.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

export const isProviderActive = (
  provider: Provider | null | undefined,
  context?: ProviderActivityContext,
): boolean => {
  if (!provider) return false;

  const completeness = context?.profileCompleteness ?? calculateProviderProfileCompleteness(provider);
  const hasWorkHistory = provider.completedProjects > 0 || provider.reviewCount > 0;
  const hasPortfolioSignal = provider.portfolioImages.length >= 1;
  const hasRecentSignal = Boolean(context?.hasRecentLeadActivity || context?.hasRecentNotificationActivity);

  // Deterministic fallback while richer activity events are expanded.
  return completeness >= 70 && (hasWorkHistory || hasPortfolioSignal || hasRecentSignal);
};

export const getProviderTrustBadges = (
  provider: Provider | null | undefined,
  context?: ProviderActivityContext,
): TrustBadgeType[] => {
  if (!provider) return [];

  const badges: TrustBadgeType[] = [];

  if (provider.verified) badges.push("verified");
  if (isProviderActive(provider, context)) badges.push("active");
  if (provider.completedProjects > 0) badges.push("registered_project");

  return badges;
};
