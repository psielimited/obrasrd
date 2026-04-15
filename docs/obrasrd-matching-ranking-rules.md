# ObrasRD Matching Ranking Rules (Deterministic, First Pass)

## Scope
This ranking layer is used after project intake on `/proyectos` to sort candidate providers before lead creation.

It is deterministic, auditable, and does not use fabricated confidence scores.

## Existing Retrieval Baseline
Current provider retrieval in `src/lib/marketplace-api.ts` orders by:
1. `is_featured` desc
2. `verified` desc
3. `rating` desc

That baseline still exists for marketplace listing.

## Deterministic Matching Layer
Implemented in `src/lib/provider-matching.ts` via `matchProvidersDeterministic(...)`.

Signals and fixed weights:
- `exactServiceMatch`: 40
- `disciplineMatch`: 20
- `stageMatch`: 15
- `workTypeMatch`: 10
- `locationCoverage`: 15
- `verificationPresence`: 8
- `portfolioPresence`: 6
- `recentActivity`: 4

`score = sum(weights where signal is true)`.

No confidence value is generated.

## Match Reasons Returned
Reasons are generated directly from true signals:
- `ofrece este servicio`
- `coincide con la disciplina`
- `trabaja en esta etapa`
- `maneja este tipo de obra`
- `trabaja en tu zona`
- `esta verificado`
- `tiene portafolio`
- `activo recientemente`

## Monetization Coexistence Rule
Critical separation maintained:
- Relevance score sorts first.
- `is_featured` is only a tie-breaker when scores are equal.

This preserves paid visibility behavior without allowing monetization to override stronger relevance.

Sort order in ranking module:
1. `score` desc
2. `is_featured` desc (tie-breaker only)
3. `rating` desc
4. `completed_projects` desc
5. `name` asc

## Intake Integration
`src/pages/ProjectBuilder.tsx` now:
1. Builds request criteria from intake selections.
2. Calls deterministic matcher.
3. Shows score + reasons per provider in selection step.
4. Submits leads through existing `createLead(...)` flow.

Side effects preserved:
- lead notifications
- quota/plan/entitlement DB logic
- existing requester/provider messaging lifecycle
