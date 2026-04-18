export const OBRASRD_ANALYTICS_EVENTS = {
  // Naming convention: snake_case + verb in past tense where possible.
  HomepageIntentClick: "homepage_intent_click",
  HomepageSearchSubmitted: "homepage_search_submitted",
  HomepageCategoryShortcutClicked: "homepage_category_shortcut_clicked",
  RegisterCompanyCtaClicked: "register_company_cta_clicked",
  StageSelected: "stage_selected",
  DisciplineSelected: "discipline_selected",
  ServiceSelected: "service_selected",
  ProviderViewed: "provider_viewed",
  ProviderContacted: "provider_contacted",
  OnboardingStarted: "onboarding_started",
  OnboardingCompleted: "onboarding_completed",
  ProjectRequestCreated: "project_request_created",
  FilterApplied: "filter_applied",
  NormalizedSearchExecuted: "normalized_search_executed",
  NoResultsSearch: "no_results_search",
  SearchUnmatchedNormalizedQuery: "search_unmatched_normalized_query",
  SearchRecoveryStateViewed: "search_recovery_state_viewed",
  SearchRecoveryActionClicked: "search_recovery_action_clicked",
  ContentToDirectoryClick: "content_to_directory_click",
} as const;

export type ObrasRdAnalyticsEventName =
  (typeof OBRASRD_ANALYTICS_EVENTS)[keyof typeof OBRASRD_ANALYTICS_EVENTS];

export interface AnalyticsStructuredIds {
  stage_id?: number;
  discipline_id?: number;
  service_id?: number;
  work_type_id?: number;
  province?: string;
}

type EventPayloadMap = {
  [OBRASRD_ANALYTICS_EVENTS.HomepageIntentClick]: AnalyticsStructuredIds & {
    intent_id: string;
    cta: "search" | "intake" | "journey";
  };
  [OBRASRD_ANALYTICS_EVENTS.HomepageSearchSubmitted]: {
    source: "hero_cta" | "intent_card";
    query?: string;
    category_slug?: string;
    target_href: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.HomepageCategoryShortcutClicked]: {
    source: "homepage_shortcuts";
    category_slug: string;
    category_name: string;
    phase_name?: string;
    target_href: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.RegisterCompanyCtaClicked]: {
    source: "homepage_hero" | "homepage_cta_section" | "top_nav" | "mobile_nav";
    target_href: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.StageSelected]: AnalyticsStructuredIds & {
    source: "search_filters" | "project_intake" | "publish_service";
    stage_slug?: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.DisciplineSelected]: AnalyticsStructuredIds & {
    source: "search_filters" | "project_intake" | "publish_service";
    discipline_slug?: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.ServiceSelected]: AnalyticsStructuredIds & {
    source: "search_filters" | "project_intake" | "publish_service";
    service_slug?: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.ProviderViewed]: AnalyticsStructuredIds & {
    provider_id: string;
    source: "search_results" | "provider_card" | "provider_profile";
  };
  [OBRASRD_ANALYTICS_EVENTS.ProviderContacted]: AnalyticsStructuredIds & {
    provider_id: string;
    method: "whatsapp" | "quote_form";
    source: "provider_card" | "provider_profile";
  };
  [OBRASRD_ANALYTICS_EVENTS.OnboardingStarted]: {
    source: "auth_signup";
    role: "provider";
    provider_type:
      | "empresa"
      | "profesional_independiente"
      | "suplidor"
      | "servicio_tecnico";
    step: 1 | 2 | 3;
  };
  [OBRASRD_ANALYTICS_EVENTS.OnboardingCompleted]: {
    source: "auth_signup" | "provider_profile_editor";
    role: "provider";
    provider_type?:
      | "empresa"
      | "profesional_independiente"
      | "suplidor"
      | "servicio_tecnico";
  };
  [OBRASRD_ANALYTICS_EVENTS.ProjectRequestCreated]: AnalyticsStructuredIds & {
    source: "project_builder" | "provider_profile" | "publish_service";
    provider_count: number;
    success_count: number;
    failed_count: number;
  };
  [OBRASRD_ANALYTICS_EVENTS.FilterApplied]: AnalyticsStructuredIds & {
    source: "search_filters" | "project_intake" | "publish_service" | "phase_page";
    filter_name:
      | "categoria"
      | "ubicacion"
      | "tipo_proveedor"
      | "etapa"
      | "disciplina"
      | "servicio"
      | "tipo_obra"
      | "solo_verificados"
      | "solo_identidad_verificada"
      | "solo_portafolio_validado"
      | "clear_all";
    has_value: boolean;
  };
  [OBRASRD_ANALYTICS_EVENTS.NormalizedSearchExecuted]: AnalyticsStructuredIds & {
    source: "search_page";
    query_hash: string;
    token_count: number;
    character_count: number;
    matched_synonym_count: number;
  };
  [OBRASRD_ANALYTICS_EVENTS.NoResultsSearch]: {
    source: "search_page" | "phase_page";
    query_hash?: string;
    category_slug?: string;
    location_slug?: string;
    stage_slug?: string;
    provider_type?: string;
    active_filter_count: number;
  };
  [OBRASRD_ANALYTICS_EVENTS.SearchUnmatchedNormalizedQuery]: {
    hash: string;
    tokenCount: number;
    characterCount: number;
    [key: string]: unknown;
  };
  [OBRASRD_ANALYTICS_EVENTS.SearchRecoveryStateViewed]: {
    source: "search_page" | "phase_page";
    state_type: "no_results" | "low_supply";
    entity_type: "providers";
    result_count: number;
    active_filter_count: number;
    stage_slug?: string;
    category_slug?: string;
    location_slug?: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.SearchRecoveryActionClicked]: {
    source: "search_page" | "phase_page";
    state_type: "no_results" | "low_supply";
    action_type: "nearby_location" | "related_category" | "lead_capture";
    target_value?: string;
    stage_slug?: string;
    category_slug?: string;
    location_slug?: string;
  };
  [OBRASRD_ANALYTICS_EVENTS.ContentToDirectoryClick]: AnalyticsStructuredIds & {
    source: "knowledge_guide" | "project_detail";
    content_slug?: string;
    project_id?: string;
    cta_type: "ver_empresas_relacionadas" | "buscar_este_servicio" | "ver_categoria_relacionada" | "ver_proveedor_relacionado";
    target_href: string;
  };
};

export type ObrasRdAnalyticsPayload<TEventName extends ObrasRdAnalyticsEventName> =
  EventPayloadMap[TEventName];
