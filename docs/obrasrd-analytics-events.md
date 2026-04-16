# ObrasRD Analytics Events

## Scope
Structured marketplace analytics for taxonomy-aware behavior across:

- homepage intent entry
- search/filter interactions
- provider view/contact actions
- project request creation

Implementation files:

- `src/lib/analytics/events.ts`
- `src/lib/analytics/track.ts`
- `src/lib/analytics/province.ts`

## Event Model

### `homepage_intent_click`
When a user clicks an intent card CTA on homepage.

Payload:

- `intent_id` (`string`)
- `cta` (`"search" | "intake" | "journey"`)
- optional structured IDs when available:
  - `stage_id`
  - `discipline_id`
  - `service_id`
  - `work_type_id`
  - `province`

### `stage_selected`
When a stage is selected in taxonomy-aware flows.

Payload:

- `source` (`"search_filters" | "project_intake" | "publish_service"`)
- `stage_id` (`number`, when available)
- `stage_slug` (`string`, when available)
- optional:
  - `province`

### `discipline_selected`
When a discipline is selected.

Payload:

- `source` (`"search_filters" | "project_intake" | "publish_service"`)
- `discipline_id` (`number`, when available)
- optional:
  - `stage_id`
  - `discipline_slug`
  - `province`

### `service_selected`
When a service is selected.

Payload:

- `source` (`"search_filters" | "project_intake" | "publish_service"`)
- `service_id` (`number`, when available)
- optional:
  - `discipline_id`
  - `stage_id`
  - `service_slug`
  - `province`

### `provider_viewed`
When a provider profile is opened.

Payload:

- `provider_id` (`string`)
- `source` (`"search_results" | "provider_card" | "provider_profile"`)
- optional:
  - `stage_id`
  - `discipline_id`
  - `service_id`
  - `work_type_id`
  - `province`

### `provider_contacted`
When user contacts provider via CTA.

Payload:

- `provider_id` (`string`)
- `method` (`"whatsapp" | "quote_form"`)
- `source` (`"provider_card" | "provider_profile"`)
- optional:
  - `stage_id`
  - `discipline_id`
  - `service_id`
  - `work_type_id`
  - `province`

### `project_request_created`
When request creation succeeds in request flows.

Payload:

- `source` (`"project_builder" | "provider_profile" | "publish_service"`)
- `provider_count` (`number`)
- `success_count` (`number`)
- `failed_count` (`number`)
- optional:
  - `stage_id`
  - `discipline_id`
  - `service_id`
  - `work_type_id`
  - `province`

### `filter_applied`
When a structured filter is changed or cleared.

Payload:

- `source` (`"search_filters" | "project_intake" | "publish_service"`)
- `filter_name` (`"categoria" | "etapa" | "disciplina" | "servicio" | "tipo_obra" | "clear_all"`)
- `has_value` (`boolean`)
- optional:
  - `stage_id`
  - `discipline_id`
  - `service_id`
  - `work_type_id`
  - `province`

### `normalized_search_executed`
When search is submitted from search page.

Payload:

- `source` (`"search_page"`)
- `query_hash` (`string`, FNV-1a hash of normalized query)
- `token_count` (`number`)
- `character_count` (`number`)
- `matched_synonym_count` (`number`)

### `search_unmatched_normalized_query`
Privacy-safe signal for unmatched colloquial terms.

Payload:

- `hash` (`string`)
- `tokenCount` (`number`)
- `characterCount` (`number`)

## Privacy Guardrails

- No raw freeform query text is logged.
- No freeform request `description`, `message`, `title`, or contact fields are logged.
- Province is derived by alias mapping (`src/lib/analytics/province.ts`) and only logged if a known match exists.
- Payload keys with empty/undefined values are dropped before dispatch to reduce noise.

## Dispatch Strategy

`trackObrasRdEvent` keeps compatibility with current behavior:

1. If `window.plausible` exists, send event there.
2. Otherwise, if `window.analytics.track` exists, send event there.
3. If neither exists, do nothing.
