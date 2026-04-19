import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProviderCard from "@/components/ProviderCard";
import { Button } from "@/components/ui/button";
import HumanPhoto from "@/components/ui/HumanPhoto";
import { usePhases, useProviderSummaries } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import {
  RELATED_PROVIDERS_AVATAR,
  RELATED_PROVIDERS_AVATAR_ALT,
} from "@/lib/journey-photos";
import { getLifecycleStageForPhase } from "@/lib/phase-stage-mapping";
import { PUBLIC_ROUTES } from "@/lib/public-ia";
import { normalizeSearchText } from "@/lib/search/search-normalization";

const PhasePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: phases = [], isLoading: isPhasesLoading } = usePhases();
  const { data: providers = [], isLoading: isProvidersLoading } = useProviderSummaries();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();
  const phase = phases.find((item) => item.slug === slug);
  const recoveryViewKeys = useRef<Set<string>>(new Set());

  const phaseProviders = useMemo(
    () => providers.filter((provider) => provider.phaseId === phase?.id),
    [providers, phase?.id],
  );

  const stateType = phaseProviders.length === 0 ? "no_results" : phaseProviders.length <= 3 ? "low_supply" : null;

  const nearbyLocationSuggestions = useMemo(() => {
    const locationCounter = new Map<string, { label: string; count: number }>();
    for (const provider of providers) {
      const normalized = normalizeSearchText(provider.city || provider.location || "");
      if (!normalized) continue;
      const current = locationCounter.get(normalized);
      if (current) {
        current.count += 1;
      } else {
        locationCounter.set(normalized, { label: provider.city || provider.location, count: 1 });
      }
    }

    return Array.from(locationCounter.entries())
      .map(([value, entry]) => ({ value, label: entry.label, count: entry.count }))
      .sort((current, next) => next.count - current.count)
      .slice(0, 3);
  }, [providers]);

  const relatedCategorySuggestions = useMemo(
    () => phase?.categories.slice(0, 3) ?? [],
    [phase?.categories],
  );

  useEffect(() => {
    if (!phase || isProvidersLoading || !stateType) return;

    const key = `${phase.slug}|${stateType}|${phaseProviders.length}`;
    if (recoveryViewKeys.current.has(key)) return;
    recoveryViewKeys.current.add(key);

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.SearchRecoveryStateViewed, {
      source: "phase_page",
      state_type: stateType,
      entity_type: "providers",
      result_count: phaseProviders.length,
      active_filter_count: 1,
      stage_slug: phase.slug,
    });
  }, [isProvidersLoading, phase, phaseProviders.length, stateType]);

  const onApplyNearbyLocation = (locationSlug: string) => {
    if (!phase || !stateType) return;

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.SearchRecoveryActionClicked, {
      source: "phase_page",
      state_type: stateType,
      action_type: "nearby_location",
      target_value: locationSlug,
      stage_slug: phase.slug,
    });

    navigate(`${PUBLIC_ROUTES.directorio}?etapa=${phase.slug}&ubicacion=${locationSlug}`);
  };

  const onApplyRelatedCategory = (categorySlug: string) => {
    if (!phase || !stateType) return;

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.SearchRecoveryActionClicked, {
      source: "phase_page",
      state_type: stateType,
      action_type: "related_category",
      target_value: categorySlug,
      stage_slug: phase.slug,
      category_slug: categorySlug,
    });

    navigate(`/buscar?categoria=${categorySlug}`);
  };

  const onOpenLeadCapture = () => {
    if (!phase || !stateType) return;

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.SearchRecoveryActionClicked, {
      source: "phase_page",
      state_type: stateType,
      action_type: "lead_capture",
      target_value: PUBLIC_ROUTES.empresas,
      stage_slug: phase.slug,
    });

    navigate(PUBLIC_ROUTES.empresas);
  };

  const onPhaseCategoryClick = (categorySlug: string) => {
    if (!phase) return;

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.FilterApplied, {
      source: "phase_page",
      filter_name: "categoria",
      has_value: true,
      stage_id: phase.id,
    });

    navigate(`/buscar?categoria=${categorySlug}`);
  };

  if (!phase && !isPhasesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Fase no encontrada.</p>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando fase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl font-black text-muted-foreground/30">
              {String(phase.id).padStart(2, "0")}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{phase.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{phase.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {phase.categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onPhaseCategoryClick(cat.slug)}
                className="text-xs font-bold px-3 py-1.5 bg-card obra-shadow rounded-lg uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Proveedores en esta fase ({phaseProviders.length})
          </h2>

          {phaseProviders.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {phaseProviders.map((provider) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    phases={phases}
                    taxonomyCatalog={taxonomyCatalog}
                  />
                ))}
              </div>
              {phaseProviders.length <= 3 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Oferta limitada en esta fase ({phaseProviders.length}). Puedes ampliar sin perder contexto.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nearbyLocationSuggestions.map((location) => (
                      <Button
                        key={location.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onApplyNearbyLocation(location.value)}
                      >
                        Ver en {location.label}
                      </Button>
                    ))}
                    {relatedCategorySuggestions.map((category) => (
                      <Button
                        key={category.slug}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onApplyRelatedCategory(category.slug)}
                      >
                        Categoria: {category.name}
                      </Button>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={onOpenLeadCapture}>
                      Publicar solicitud
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card p-8 rounded-xl obra-shadow text-center">
                <p className="text-sm text-muted-foreground">
                  No hay proveedores registrados en esta fase todavia.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-foreground">
                  Mientras se activa oferta en esta fase, puedes explorar zonas con disponibilidad o publicar una solicitud.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {nearbyLocationSuggestions.map((location) => (
                    <Button
                      key={location.value}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onApplyNearbyLocation(location.value)}
                    >
                      Buscar en {location.label}
                    </Button>
                  ))}
                  {relatedCategorySuggestions.map((category) => (
                    <Button
                      key={category.slug}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onApplyRelatedCategory(category.slug)}
                    >
                      Ver {category.name}
                    </Button>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={onOpenLeadCapture}>
                    Publicar solicitud de servicio
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhasePage;
