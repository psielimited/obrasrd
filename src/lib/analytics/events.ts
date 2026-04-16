export const OBRASRD_ANALYTICS_EVENTS = {
  HomepageIntentClick: "homepage_intent_click",
  StageSelected: "stage_selected",
  DisciplineSelected: "discipline_selected",
  ServiceSelected: "service_selected",
  ProviderViewed: "provider_viewed",
  ProviderContacted: "provider_contacted",
  ProjectRequestCreated: "project_request_created",
  FilterApplied: "filter_applied",
  NormalizedSearchExecuted: "normalized_search_executed",
  SearchUnmatchedNormalizedQuery: "search_unmatched_normalized_query",
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
  [OBRASRD_ANALYTICS_EVENTS.ProjectRequestCreated]: AnalyticsStructuredIds & {
    source: "project_builder" | "provider_profile" | "publish_service";
    provider_count: number;
    success_count: number;
    failed_count: number;
  };
  [OBRASRD_ANALYTICS_EVENTS.FilterApplied]: AnalyticsStructuredIds & {
    source: "search_filters" | "project_intake" | "publish_service";
    filter_name: "categoria" | "etapa" | "disciplina" | "servicio" | "tipo_obra" | "clear_all";
    has_value: boolean;
  };
  [OBRASRD_ANALYTICS_EVENTS.NormalizedSearchExecuted]: AnalyticsStructuredIds & {
    source: "search_page";
    query_hash: string;
    token_count: number;
    character_count: number;
    matched_synonym_count: number;
  };
  [OBRASRD_ANALYTICS_EVENTS.SearchUnmatchedNormalizedQuery]: {
    hash: string;
    tokenCount: number;
    characterCount: number;
    [key: string]: unknown;
  };
};

export type ObrasRdAnalyticsPayload<TEventName extends ObrasRdAnalyticsEventName> =
  EventPayloadMap[TEventName];
