import type { Provider } from "@/data/marketplace";

export type TrustBadgeType =
  | "provider_verified"
  | "identity_confirmed"
  | "portfolio_validated"
  | "project_registered"
  | "rapid_response"
  | "active_this_month";

export type ProviderResponseSignal = "rapid" | "standard";
export type ProviderCompletenessTier = "critical" | "needs_attention" | "solid" | "excellent";

export interface ProviderProfileQualitySignal {
  id:
    | "identity"
    | "specialization"
    | "coverage"
    | "description"
    | "contact"
    | "portfolio_presence"
    | "portfolio_depth"
    | "experience"
    | "social_proof";
  label: string;
  helpText: string;
  done: boolean;
  weight: number;
}

export interface ProviderProfileQualitySnapshot {
  score: number;
  completedWeight: number;
  totalWeight: number;
  tier: ProviderCompletenessTier;
  items: ProviderProfileQualitySignal[];
  recommendations: string[];
}

interface ProviderActivityContext {
  profileCompleteness?: number;
  hasRecentLeadActivity?: boolean;
  hasRecentNotificationActivity?: boolean;
}

const COMPLETENESS_TOTAL_WEIGHT = 100;
const RECOMMENDED_PORTFOLIO_IMAGES = 3;

const toNumericWhatsapp = (value: string | undefined) => (value ?? "").replace(/\D/g, "");

const resolveCompletenessTier = (score: number): ProviderCompletenessTier => {
  if (score >= 85) return "excellent";
  if (score >= 70) return "solid";
  if (score >= 45) return "needs_attention";
  return "critical";
};

export const getProviderProfileQualitySnapshot = (
  provider: Provider | null | undefined,
): ProviderProfileQualitySnapshot => {
  if (!provider) {
    return {
      score: 0,
      completedWeight: 0,
      totalWeight: COMPLETENESS_TOTAL_WEIGHT,
      tier: "critical",
      items: [],
      recommendations: [],
    };
  }

  const descriptionLength = provider.description.trim().length;
  const whatsappDigits = toNumericWhatsapp(provider.whatsapp);
  const hasTaxonomySpecialization =
    Boolean(provider.primaryDisciplineId) ||
    Boolean(provider.primaryServiceId) ||
    (provider.serviceIds?.length ?? 0) > 0 ||
    (provider.workTypeIds?.length ?? 0) > 0;

  const items: ProviderProfileQualitySignal[] = [
    {
      id: "identity",
      label: "Identidad comercial",
      helpText: "Completa nombre y oficio principal.",
      done: Boolean(provider.name.trim()) && Boolean(provider.trade.trim()),
      weight: 10,
    },
    {
      id: "specialization",
      label: "Especialidad definida",
      helpText: "Configura etapa, categoria y servicios concretos.",
      done:
        provider.phaseId > 0 &&
        Boolean(provider.categorySlug.trim()) &&
        hasTaxonomySpecialization,
      weight: 15,
    },
    {
      id: "coverage",
      label: "Cobertura clara",
      helpText: "Agrega ciudad, ubicacion y zonas de servicio.",
      done:
        Boolean(provider.city.trim()) &&
        Boolean(provider.location.trim()) &&
        provider.serviceAreas.length > 0,
      weight: 15,
    },
    {
      id: "description",
      label: "Descripcion completa",
      helpText: "Describe experiencia, tipo de trabajo y alcance (80+ caracteres).",
      done: descriptionLength >= 80,
      weight: 15,
    },
    {
      id: "contact",
      label: "Contacto disponible",
      helpText: "Incluye WhatsApp valido para cotizaciones.",
      done: whatsappDigits.length >= 8,
      weight: 15,
    },
    {
      id: "portfolio_presence",
      label: "Portafolio publicado",
      helpText: "Publica al menos una foto real.",
      done: provider.portfolioImages.length > 0,
      weight: 10,
    },
    {
      id: "portfolio_depth",
      label: "Portafolio robusto",
      helpText: `Recomendado: ${RECOMMENDED_PORTFOLIO_IMAGES}+ fotos para generar confianza.`,
      done: provider.portfolioImages.length >= RECOMMENDED_PORTFOLIO_IMAGES,
      weight: 10,
    },
    {
      id: "experience",
      label: "Experiencia declarada",
      helpText: "Registra anos de experiencia.",
      done: provider.yearsExperience > 0,
      weight: 5,
    },
    {
      id: "social_proof",
      label: "Prueba de ejecucion",
      helpText: "Muestra proyectos completados o resenas.",
      done: provider.completedProjects > 0 || provider.reviewCount > 0,
      weight: 5,
    },
  ];

  const completedWeight = items.reduce(
    (sum, item) => (item.done ? sum + item.weight : sum),
    0,
  );
  const score = Math.round((completedWeight / COMPLETENESS_TOTAL_WEIGHT) * 100);

  return {
    score,
    completedWeight,
    totalWeight: COMPLETENESS_TOTAL_WEIGHT,
    tier: resolveCompletenessTier(score),
    items,
    recommendations: items.filter((item) => !item.done).map((item) => item.helpText),
  };
};

export const calculateProviderProfileCompleteness = (provider: Provider | null | undefined): number => {
  return getProviderProfileQualitySnapshot(provider).score;
};

export const isProviderActive = (
  provider: Provider | null | undefined,
  context?: ProviderActivityContext,
): boolean => {
  if (!provider) return false;
  if (provider.trustSnapshot) return provider.trustSnapshot.activeThisMonth;

  const completeness = context?.profileCompleteness ?? calculateProviderProfileCompleteness(provider);
  const hasWorkHistory = provider.completedProjects > 0 || provider.reviewCount > 0;
  const hasPortfolioSignal = provider.portfolioImages.length >= 1;
  const hasRecentSignal = Boolean(context?.hasRecentLeadActivity || context?.hasRecentNotificationActivity);

  // Deterministic fallback while richer activity events are expanded.
  return completeness >= 70 && (hasWorkHistory || hasPortfolioSignal || hasRecentSignal);
};

export const getProviderTrustBadges = (
  provider: Provider | null | undefined,
  _context?: ProviderActivityContext,
): TrustBadgeType[] => {
  if (!provider) return [];

  const badges: TrustBadgeType[] = [];
  const trust = provider.trustSnapshot;

  if (trust?.providerVerified || provider.verified) badges.push("provider_verified");
  if (trust?.identityConfirmed) badges.push("identity_confirmed");
  if (trust?.portfolioValidated) badges.push("portfolio_validated");
  if (trust?.projectRegistered) badges.push("project_registered");
  if (trust?.rapidResponse) badges.push("rapid_response");

  if (trust?.activeThisMonth) badges.push("active_this_month");

  return badges;
};

export const getProviderResponseSignal = (
  provider: Provider | null | undefined,
): ProviderResponseSignal => {
  if (!provider) return "standard";
  return provider.trustSnapshot?.rapidResponse ? "rapid" : "standard";
};
