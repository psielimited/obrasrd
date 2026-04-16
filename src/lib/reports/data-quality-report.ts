import { supabase } from "@/integrations/supabase/client";
import { buildSearchNormalization } from "@/lib/search/search-normalization";

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

interface ProviderBaseRow {
  id: string;
  name: string;
  trade: string;
  category_slug: string;
  phase_id: number;
  primary_discipline_id: number | null;
  primary_service_id: number | null;
  location: string;
  city: string;
  portfolio_images: string[] | null;
  is_featured: boolean;
  verified: boolean;
  updated_at: string;
}

interface ProviderServiceRow {
  provider_id: string;
  service_id: number;
}

interface ProviderWorkTypeRow {
  provider_id: string;
  work_type_id: number;
}

interface PortfolioProjectRow {
  id: string;
  provider_id: string;
}

interface ProviderTrustSignalRow {
  provider_id: string | null;
  provider_verified: boolean | null;
  identity_confirmed: boolean | null;
  portfolio_validated: boolean | null;
  project_registered: boolean | null;
  rapid_response: boolean | null;
  active_this_month: boolean | null;
}

interface LeadRow {
  id: string;
  created_at: string;
  message: string;
  requested_stage_id: number | null;
  requested_discipline_id: number | null;
  requested_service_id: number | null;
  requested_work_type_id: number | null;
}

export interface ProviderDataQualityItem {
  providerId: string;
  providerName: string;
  trade: string;
  categorySlug: string;
  phaseId: number;
  primaryDisciplineId?: number;
  primaryServiceId?: number;
  serviceCount: number;
  workTypeCount: number;
  city?: string;
  location?: string;
  portfolioImageCount: number;
  portfolioProjectCount: number;
  isFeatured: boolean;
  verified: boolean;
}

export interface VerificationInconsistencyItem {
  providerId: string;
  providerName: string;
  verified: boolean;
  trustProviderVerified?: boolean;
  trustIdentityConfirmed?: boolean;
  trustPortfolioValidated?: boolean;
  trustActiveThisMonth?: boolean;
  issues: string[];
}

export interface UnmappedRequestTermItem {
  hash: string;
  tokenCount: number;
  characterCount: number;
  requestCount: number;
  latestCreatedAt: string;
  missingStructuredRequestCount: number;
  sampleLeadIds: string[];
}

export interface FeaturedMissingStructuredItem {
  providerId: string;
  providerName: string;
  missingTaxonomyBindings: boolean;
  missingLocation: boolean;
  missingPortfolio: boolean;
}

export interface DataQualityReport {
  generatedAt: string;
  source: "supabase" | "fallback";
  leadLookbackDays: number;
  leadLimit: number;
  scannedLeadCount: number;
  providersMissingTaxonomyBindings: ProviderDataQualityItem[];
  providersMissingLocation: ProviderDataQualityItem[];
  providersMissingPortfolio: ProviderDataQualityItem[];
  providersLegacyCategoryOnly: ProviderDataQualityItem[];
  projectRequestsUnmappedNormalizedTerms: UnmappedRequestTermItem[];
  providersVerificationInconsistencies: VerificationInconsistencyItem[];
  featuredPlacementMissingStructuredData: FeaturedMissingStructuredItem[];
}

export interface DataQualityReportOptions {
  leadLookbackDays?: number;
  leadLimit?: number;
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

const toMaybeTrimmed = (value?: string | null) => value?.trim() || undefined;

const getMonthStartIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

const extractLeadTextCandidate = (message: string): string => {
  const trimmed = message.trim();
  if (!trimmed) return "";

  const marker = "Descripcion:";
  const markerIndex = trimmed.indexOf(marker);

  if (markerIndex >= 0) {
    const afterMarker = trimmed.slice(markerIndex + marker.length);
    const beforeAttachments = afterMarker.split("\nAdjuntos:")[0] ?? afterMarker;
    return beforeAttachments.trim();
  }

  return trimmed.slice(0, 500).trim();
};

const toProviderItem = (
  provider: ProviderBaseRow,
  serviceCount: number,
  workTypeCount: number,
  portfolioProjectCount: number,
): ProviderDataQualityItem => ({
  providerId: provider.id,
  providerName: provider.name,
  trade: provider.trade,
  categorySlug: provider.category_slug,
  phaseId: provider.phase_id,
  primaryDisciplineId: provider.primary_discipline_id ?? undefined,
  primaryServiceId: provider.primary_service_id ?? undefined,
  serviceCount,
  workTypeCount,
  city: toMaybeTrimmed(provider.city),
  location: toMaybeTrimmed(provider.location),
  portfolioImageCount: provider.portfolio_images?.length ?? 0,
  portfolioProjectCount,
  isFeatured: provider.is_featured,
  verified: provider.verified,
});

export const getDataQualityReport = async (
  options: DataQualityReportOptions = {},
): Promise<DataQualityReport> => {
  const generatedAt = new Date().toISOString();
  const leadLookbackDays = Math.max(7, Math.min(365, options.leadLookbackDays ?? 90));
  const leadLimit = Math.max(100, Math.min(10_000, options.leadLimit ?? 2_000));
  const leadWindowStart = new Date();
  leadWindowStart.setDate(leadWindowStart.getDate() - leadLookbackDays);
  const leadWindowStartIso = leadWindowStart.toISOString();

  if (!hasSupabaseConfig) {
    return {
      generatedAt,
      source: "fallback",
      leadLookbackDays,
      leadLimit,
      scannedLeadCount: 0,
      providersMissingTaxonomyBindings: [],
      providersMissingLocation: [],
      providersMissingPortfolio: [],
      providersLegacyCategoryOnly: [],
      projectRequestsUnmappedNormalizedTerms: [],
      providersVerificationInconsistencies: [],
      featuredPlacementMissingStructuredData: [],
    };
  }

  const [providersRes, providerServicesRes, providerWorkTypesRes, trustRes, leadsRes, portfolioProjectsRes] =
    await Promise.all([
      (supabase.from as any)("providers").select(
        "id,name,trade,category_slug,phase_id,primary_discipline_id,primary_service_id,location,city,portfolio_images,is_featured,verified,updated_at",
      ),
      (supabase.from as any)("provider_services").select("provider_id,service_id"),
      (supabase.from as any)("provider_work_types").select("provider_id,work_type_id"),
      (supabase.from as any)("provider_trust_signals").select(
        "provider_id,provider_verified,identity_confirmed,portfolio_validated,project_registered,rapid_response,active_this_month",
      ),
      (supabase.from as any)(
        "leads",
      ).select(
        "id,created_at,message,requested_stage_id,requested_discipline_id,requested_service_id,requested_work_type_id",
      )
        .gte("created_at", leadWindowStartIso)
        .order("created_at", { ascending: false })
        .limit(leadLimit),
      (supabase.from as any)("portfolio_projects").select("id,provider_id"),
    ]);

  if (providersRes.error) {
    throw providersRes.error;
  }

  const providers = (providersRes.data ?? []) as ProviderBaseRow[];
  const providerServices = (providerServicesRes.data ?? []) as ProviderServiceRow[];
  const providerWorkTypes = (providerWorkTypesRes.data ?? []) as ProviderWorkTypeRow[];
  const trustSignals = (trustRes.data ?? []) as ProviderTrustSignalRow[];
  const leads = (leadsRes.data ?? []) as LeadRow[];
  const portfolioProjects = (portfolioProjectsRes.data ?? []) as PortfolioProjectRow[];

  const serviceCountByProvider = new Map<string, number>();
  for (const row of providerServices) {
    serviceCountByProvider.set(row.provider_id, (serviceCountByProvider.get(row.provider_id) ?? 0) + 1);
  }

  const workTypeCountByProvider = new Map<string, number>();
  for (const row of providerWorkTypes) {
    workTypeCountByProvider.set(row.provider_id, (workTypeCountByProvider.get(row.provider_id) ?? 0) + 1);
  }

  const portfolioProjectCountByProvider = new Map<string, number>();
  for (const row of portfolioProjects) {
    portfolioProjectCountByProvider.set(
      row.provider_id,
      (portfolioProjectCountByProvider.get(row.provider_id) ?? 0) + 1,
    );
  }

  const trustByProvider = new Map<string, ProviderTrustSignalRow>();
  for (const row of trustSignals) {
    if (!row.provider_id) continue;
    trustByProvider.set(row.provider_id, row);
  }

  const monthStartIso = getMonthStartIso();

  const providerFlags = providers.map((provider) => {
    const serviceCount = serviceCountByProvider.get(provider.id) ?? 0;
    const workTypeCount = workTypeCountByProvider.get(provider.id) ?? 0;
    const portfolioProjectCount = portfolioProjectCountByProvider.get(provider.id) ?? 0;
    const hasPortfolio = (provider.portfolio_images?.length ?? 0) > 0 || portfolioProjectCount > 0;
    const hasLocation = Boolean(provider.location?.trim() || provider.city?.trim());
    const hasStructuredTaxonomy =
      Boolean(provider.primary_discipline_id) ||
      Boolean(provider.primary_service_id) ||
      serviceCount > 0 ||
      workTypeCount > 0;
    const legacyOnly = Boolean(provider.category_slug) && !hasStructuredTaxonomy;

    return {
      provider,
      serviceCount,
      workTypeCount,
      portfolioProjectCount,
      hasPortfolio,
      hasLocation,
      hasStructuredTaxonomy,
      legacyOnly,
    };
  });

  const providersMissingTaxonomyBindings = providerFlags
    .filter((item) => !item.hasStructuredTaxonomy)
    .map((item) =>
      toProviderItem(item.provider, item.serviceCount, item.workTypeCount, item.portfolioProjectCount),
    );

  const providersMissingLocation = providerFlags
    .filter((item) => !item.hasLocation)
    .map((item) =>
      toProviderItem(item.provider, item.serviceCount, item.workTypeCount, item.portfolioProjectCount),
    );

  const providersMissingPortfolio = providerFlags
    .filter((item) => !item.hasPortfolio)
    .map((item) =>
      toProviderItem(item.provider, item.serviceCount, item.workTypeCount, item.portfolioProjectCount),
    );

  const providersLegacyCategoryOnly = providerFlags
    .filter((item) => item.legacyOnly)
    .map((item) =>
      toProviderItem(item.provider, item.serviceCount, item.workTypeCount, item.portfolioProjectCount),
    );

  const providersVerificationInconsistencies: VerificationInconsistencyItem[] = [];
  for (const item of providerFlags) {
    const trust = trustByProvider.get(item.provider.id);
    if (!trust) continue;

    const issues: string[] = [];
    if (typeof trust.provider_verified === "boolean" && trust.provider_verified !== item.provider.verified) {
      issues.push("provider_verified no coincide con providers.verified");
    }
    if (trust.portfolio_validated === true && !item.hasPortfolio) {
      issues.push("portfolio_validated=true pero no hay portafolio");
    }
    if (trust.active_this_month === true && item.provider.updated_at < monthStartIso) {
      issues.push("active_this_month=true con provider.updated_at fuera del mes actual");
    }
    if (trust.identity_confirmed === true && item.provider.verified === false) {
      issues.push("identity_confirmed=true con provider no verificado");
    }

    if (issues.length === 0) continue;

    providersVerificationInconsistencies.push({
      providerId: item.provider.id,
      providerName: item.provider.name,
      verified: item.provider.verified,
      trustProviderVerified: trust.provider_verified ?? undefined,
      trustIdentityConfirmed: trust.identity_confirmed ?? undefined,
      trustPortfolioValidated: trust.portfolio_validated ?? undefined,
      trustActiveThisMonth: trust.active_this_month ?? undefined,
      issues,
    });
  }

  const featuredPlacementMissingStructuredData = providerFlags
    .filter((item) => item.provider.is_featured)
    .map((item) => ({
      providerId: item.provider.id,
      providerName: item.provider.name,
      missingTaxonomyBindings: !item.hasStructuredTaxonomy,
      missingLocation: !item.hasLocation,
      missingPortfolio: !item.hasPortfolio,
    }))
    .filter((item) => item.missingTaxonomyBindings || item.missingLocation || item.missingPortfolio);

  const groupedUnmappedTerms = new Map<string, UnmappedRequestTermItem>();
  for (const lead of leads) {
    const candidate = extractLeadTextCandidate(lead.message);
    if (!candidate) continue;

    const normalized = buildSearchNormalization(candidate);
    if (!normalized.unmatchedNormalizedQuery || !normalized.normalizedQuery) continue;

    const hash = hashFnv1a(normalized.normalizedQuery);
    const existing = groupedUnmappedTerms.get(hash);
    const missingStructured =
      !lead.requested_stage_id &&
      !lead.requested_discipline_id &&
      !lead.requested_service_id &&
      !lead.requested_work_type_id;

    if (!existing) {
      groupedUnmappedTerms.set(hash, {
        hash,
        tokenCount: normalized.normalizedTokens.length,
        characterCount: normalized.normalizedQuery.length,
        requestCount: 1,
        latestCreatedAt: lead.created_at,
        missingStructuredRequestCount: missingStructured ? 1 : 0,
        sampleLeadIds: [lead.id],
      });
      continue;
    }

    existing.requestCount += 1;
    if (lead.created_at > existing.latestCreatedAt) {
      existing.latestCreatedAt = lead.created_at;
    }
    if (missingStructured) {
      existing.missingStructuredRequestCount += 1;
    }
    if (existing.sampleLeadIds.length < 5) {
      existing.sampleLeadIds.push(lead.id);
    }
  }

  const projectRequestsUnmappedNormalizedTerms = Array.from(groupedUnmappedTerms.values()).sort(
    (a, b) => b.requestCount - a.requestCount,
  );

  return {
    generatedAt,
    source: "supabase",
    leadLookbackDays,
    leadLimit,
    scannedLeadCount: leads.length,
    providersMissingTaxonomyBindings,
    providersMissingLocation,
    providersMissingPortfolio,
    providersLegacyCategoryOnly,
    projectRequestsUnmappedNormalizedTerms,
    providersVerificationInconsistencies,
    featuredPlacementMissingStructuredData,
  };
};
