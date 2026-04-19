import { ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HumanPhoto from "@/components/ui/HumanPhoto";
import {
  CUSTOMER_JOURNEYS,
  JOURNEY_RESOURCE_TYPE_LABELS,
  getJourneyResourceTypeLabel,
  getJourneyStageLabel,
  getJourneyWorkTypeLabel,
  groupJourneysByLifecycleStage,
  LIFECYCLE_STAGE_ORDER,
  toJourneyIntakeHref,
  toJourneySearchHref,
  type CustomerJourneyDefinition,
} from "@/lib/customer-journeys";
import {
  CONOCIMIENTO_HERO_ALT,
  CONOCIMIENTO_HERO_PHOTO,
  getStagePhoto,
  getStagePhotoAlt,
} from "@/lib/journey-photos";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

const RESOURCE_TYPE_ORDER: readonly CustomerJourneyDefinition["resourceType"][] = [
  "articulo_tecnico",
  "guia_practica",
  "conocimiento_practico",
] as const;

const isLifecycleStage = (value: string): value is (typeof LIFECYCLE_STAGE_ORDER)[number] =>
  LIFECYCLE_STAGE_ORDER.some((item) => item === value);

const isResourceType = (value: string): value is CustomerJourneyDefinition["resourceType"] =>
  RESOURCE_TYPE_ORDER.some((item) => item === value);

const JourneyGuidesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const stageParam = searchParams.get("etapa") || "";
  const resourceParam = searchParams.get("recurso") || "";
  const selectedStage = isLifecycleStage(stageParam) ? stageParam : "";
  const selectedResourceType = isResourceType(resourceParam) ? resourceParam : "";

  const filteredJourneys = selectedStage
    ? CUSTOMER_JOURNEYS.filter((journey) => journey.stageSlug === selectedStage)
    : CUSTOMER_JOURNEYS;
  const stageAndResourceJourneys = selectedResourceType
    ? filteredJourneys.filter((journey) => journey.resourceType === selectedResourceType)
    : filteredJourneys;

  const groupedStageArchive = groupJourneysByLifecycleStage(stageAndResourceJourneys).filter((group) => group.journeys.length > 0);

  const onToggleStage = (stageSlug: string) => {
    const next = new URLSearchParams(searchParams);

    if (selectedStage === stageSlug) {
      next.delete("etapa");
    } else {
      next.set("etapa", stageSlug);
    }

    setSearchParams(next, { replace: true });
  };

  const onToggleResourceType = (resourceType: CustomerJourneyDefinition["resourceType"]) => {
    const next = new URLSearchParams(searchParams);

    if (selectedResourceType === resourceType) {
      next.delete("recurso");
    } else {
      next.set("recurso", resourceType);
    }

    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <section className="border-b border-border">
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Archivo de conocimiento
              </p>
              <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                Conocimiento tecnico por ciclo de proyecto en Republica Dominicana
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Organiza articulos tecnicos, guias practicas y conocimiento aplicado por Planificacion, Construccion y Mantenimiento.
                Este espacio orienta decisiones, mientras tus acciones principales siguen en Directorio y Solicitudes.
              </p>
            </div>
            <HumanPhoto
              src={CONOCIMIENTO_HERO_PHOTO}
              alt={CONOCIMIENTO_HERO_ALT}
              aspect="16/9"
              priority
              sizesHint="(min-width: 768px) 45vw, 100vw"
              className="rounded-lg border border-border"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {LIFECYCLE_STAGE_ORDER.map((stageSlug) => {
              const selected = selectedStage === stageSlug;
              const sampleJourney = CUSTOMER_JOURNEYS.find((journey) => journey.stageSlug === stageSlug);
              const stageLabel = sampleJourney ? getJourneyStageLabel(sampleJourney) : stageSlug;

              return (
                <Button
                  key={stageSlug}
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleStage(stageSlug)}
                >
                  {stageLabel}
                </Button>
              );
            })}
            {selectedStage && (
              <Button variant="ghost" size="sm" onClick={() => onToggleStage(selectedStage)}>
                Limpiar filtro
              </Button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {RESOURCE_TYPE_ORDER.map((resourceType) => (
              <Button
                key={resourceType}
                variant={selectedResourceType === resourceType ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleResourceType(resourceType)}
              >
                {JOURNEY_RESOURCE_TYPE_LABELS[resourceType]}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 md:py-8">
        <div className="container mx-auto max-w-5xl space-y-6">
          {groupedStageArchive.length === 0 ? (
            <Card className="border-border/80 bg-card p-5 text-sm text-muted-foreground">
              No encontramos recursos con ese filtro de etapa.
            </Card>
          ) : (
            groupedStageArchive.map((stageGroup) => (
              <section key={stageGroup.stageSlug} className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {stageGroup.stageLabel}
                  </p>
                  <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">
                    {stageGroup.stageLabel}: recursos del archivo
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{stageGroup.stageDescription}</p>
                </div>

                {RESOURCE_TYPE_ORDER.map((resourceType) => {
                  const resources = stageGroup.journeys.filter((journey) => journey.resourceType === resourceType);
                  if (resources.length === 0) return null;

                  return (
                    <div key={`${stageGroup.stageSlug}-${resourceType}`} className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {getJourneyResourceTypeLabel(resources[0])}
                      </p>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {resources.map((journey) => (
                          <Card key={journey.slug} className="border-border/80 bg-card p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                              {getJourneyStageLabel(journey)}
                            </p>
                            <h3 className="mt-1 text-lg font-black leading-tight text-foreground">{journey.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{journey.summary}</p>

                            {getJourneyWorkTypeLabel(journey) && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                Tipo de obra: <span className="font-semibold text-foreground">{getJourneyWorkTypeLabel(journey)}</span>
                              </p>
                            )}

                            <p className="mt-2 text-xs text-muted-foreground">
                              Contexto RD: <span className="text-foreground">{journey.dominicanContextNote}</span>
                            </p>

                            <div className="mt-4 flex flex-col gap-2">
                              <Button asChild variant="outline" className="justify-between">
                                <Link to={PUBLIC_ROUTES.conocimientoDetail(journey.slug)}>
                                  Ver recurso
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                <Button asChild variant="ghost" size="sm" className="justify-start px-0">
                                  <Link to={toJourneySearchHref(journey)}>Ver proveedores</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm" className="justify-end px-0">
                                  <Link to={toJourneyIntakeHref(journey)}>Iniciar solicitud</Link>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default JourneyGuidesPage;
