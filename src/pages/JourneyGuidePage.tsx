import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import JourneyTemplate from "@/components/journeys/JourneyTemplate";
import { Button } from "@/components/ui/button";
import { useProviderSummaries } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { buildDirectoryTopicHref } from "@/lib/content-directory-links";
import {
  getCustomerJourneyBySlug,
  getJourneyDisciplineLabels,
  getJourneyResourceTypeLabel,
  getJourneyServiceLabels,
  getJourneyStageLabel,
  getJourneyWorkTypeLabel,
  toJourneyIntakeHref,
  toJourneySearchHref,
} from "@/lib/customer-journeys";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

const JourneyGuidePage = () => {
  const { slug } = useParams();
  const journey = getCustomerJourneyBySlug(slug);
  const { data: providers = [] } = useProviderSummaries();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();

  const disciplineLabels = useMemo(() => {
    if (!journey) return [];
    const bySlug = new Map((taxonomyCatalog?.disciplines ?? []).map((item) => [item.slug, item.name]));
    return getJourneyDisciplineLabels(journey).map((label, index) => {
      const slugKey = journey.disciplineSlugs[index];
      return bySlug.get(slugKey) ?? label;
    });
  }, [journey, taxonomyCatalog?.disciplines]);

  const serviceLabels = useMemo(() => {
    if (!journey) return [];
    const bySlug = new Map((taxonomyCatalog?.services ?? []).map((item) => [item.slug, item.name]));
    return getJourneyServiceLabels(journey).map((label, index) => {
      const slugKey = journey.serviceSlugs[index];
      return bySlug.get(slugKey) ?? label;
    });
  }, [journey, taxonomyCatalog?.services]);

  const stageLabel = useMemo(() => {
    if (!journey) return "";
    return getJourneyStageLabel(journey);
  }, [journey]);

  const resourceTypeLabel = useMemo(() => {
    if (!journey) return "";
    return getJourneyResourceTypeLabel(journey);
  }, [journey]);

  const workTypeLabel = useMemo(() => {
    if (!journey) return undefined;
    if (!journey.workTypeSlug) return undefined;
    const fromCatalog = (taxonomyCatalog?.workTypes ?? []).find((item) => item.code === journey.workTypeSlug)?.name;
    return fromCatalog ?? getJourneyWorkTypeLabel(journey);
  }, [journey, taxonomyCatalog?.workTypes]);

  const firstDisciplineSlug = journey?.disciplineSlugs[0];
  const firstServiceSlug = journey?.serviceSlugs[0];

  const stageId = useMemo(() => {
    if (!journey) return undefined;
    return taxonomyCatalog?.stages.find((item) => item.slug === journey.stageSlug)?.id;
  }, [journey, taxonomyCatalog?.stages]);

  const disciplineIds = useMemo(() => {
    if (!journey) return [] as number[];
    const bySlug = new Map((taxonomyCatalog?.disciplines ?? []).map((item) => [item.slug, item.id]));
    return journey.disciplineSlugs.map((slugKey) => bySlug.get(slugKey)).filter((item): item is number => Boolean(item));
  }, [journey, taxonomyCatalog?.disciplines]);

  const serviceIds = useMemo(() => {
    if (!journey) return [] as number[];
    const bySlug = new Map((taxonomyCatalog?.services ?? []).map((item) => [item.slug, item.id]));
    return journey.serviceSlugs.map((slugKey) => bySlug.get(slugKey)).filter((item): item is number => Boolean(item));
  }, [journey, taxonomyCatalog?.services]);

  const workTypeId = useMemo(() => {
    if (!journey?.workTypeSlug) return undefined;
    return taxonomyCatalog?.workTypes.find((item) => item.code === journey.workTypeSlug)?.id;
  }, [journey?.workTypeSlug, taxonomyCatalog?.workTypes]);

  const topicDirectoryLinks = useMemo(() => {
    if (!journey) return [] as { label: string; href: string; ctaType: "ver_empresas_relacionadas" | "buscar_este_servicio" | "ver_categoria_relacionada" }[];

    const links = [
      {
        label: "Ver empresas relacionadas",
        href: toJourneySearchHref(journey),
        ctaType: "ver_empresas_relacionadas" as const,
      },
      {
        label: "Buscar este servicio",
        href: buildDirectoryTopicHref({
          servicio: firstServiceSlug,
          etapa: journey.stageSlug,
        }),
        ctaType: "buscar_este_servicio" as const,
      },
      {
        label: "Ver categoria relacionada",
        href: buildDirectoryTopicHref({
          etapa: journey.stageSlug,
          disciplina: firstDisciplineSlug,
        }),
        ctaType: "ver_categoria_relacionada" as const,
      },
    ];

    return Array.from(new Map(links.map((item) => [item.href, item])).values());
  }, [firstDisciplineSlug, firstServiceSlug, journey]);

  const relatedProviders = useMemo(() => {
    if (!journey) return [];

    const scored = providers
      .map((provider) => {
        let score = 0;

        if (provider.primaryDisciplineId && disciplineIds.includes(provider.primaryDisciplineId)) score += 2;
        if (provider.primaryServiceId && serviceIds.includes(provider.primaryServiceId)) score += 4;

        for (const serviceId of provider.serviceIds ?? []) {
          if (serviceIds.includes(serviceId)) score += 2;
        }

        for (const typeId of provider.workTypeIds ?? []) {
          if (workTypeId && typeId === workTypeId) score += 2;
        }

        return { provider, score };
      })
      .filter((item) => item.score > 0)
      .sort((current, next) => {
        if (next.score !== current.score) return next.score - current.score;
        if (next.provider.verified !== current.provider.verified) return Number(next.provider.verified) - Number(current.provider.verified);
        return next.provider.rating - current.provider.rating;
      })
      .slice(0, 4)
      .map((item) => item.provider);

    return scored;
  }, [disciplineIds, journey, providers, serviceIds, workTypeId]);

  const onContentDirectoryClick = (payload: { ctaType: "ver_empresas_relacionadas" | "buscar_este_servicio" | "ver_categoria_relacionada" | "ver_proveedor_relacionado"; href: string }) => {
    if (!journey) return;

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ContentToDirectoryClick, {
      source: "knowledge_guide",
      content_slug: journey.slug,
      cta_type: payload.ctaType,
      target_href: payload.href,
      stage_id: stageId,
      discipline_id: disciplineIds[0],
      service_id: serviceIds[0],
      work_type_id: workTypeId,
    });
  };

  if (!journey) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="container mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-lg font-semibold text-foreground">Guia no encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">Esta ruta no existe o fue movida.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to={PUBLIC_ROUTES.conocimiento}>Ir a conocimiento</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <JourneyTemplate
      journey={journey}
      stageLabel={stageLabel}
      resourceTypeLabel={resourceTypeLabel}
      dominicanContextNote={journey.dominicanContextNote}
      workTypeLabel={workTypeLabel}
      disciplineLabels={disciplineLabels}
      serviceLabels={serviceLabels}
      intakeHref={toJourneyIntakeHref(journey)}
      searchHref={toJourneySearchHref(journey)}
      topicDirectoryLinks={topicDirectoryLinks}
      relatedProviders={relatedProviders}
      onContentDirectoryClick={onContentDirectoryClick}
    />
  );
};

export default JourneyGuidePage;
