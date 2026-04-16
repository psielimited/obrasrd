import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import JourneyTemplate from "@/components/journeys/JourneyTemplate";
import { Button } from "@/components/ui/button";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import {
  getCustomerJourneyBySlug,
  getJourneyDisciplineLabels,
  getJourneyServiceLabels,
  getJourneyStageLabel,
  getJourneyWorkTypeLabel,
  toJourneyIntakeHref,
  toJourneySearchHref,
} from "@/lib/customer-journeys";

const JourneyGuidePage = () => {
  const { slug } = useParams();
  const journey = getCustomerJourneyBySlug(slug);
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

  const workTypeLabel = useMemo(() => {
    if (!journey) return undefined;
    if (!journey.workTypeSlug) return undefined;
    const fromCatalog = (taxonomyCatalog?.workTypes ?? []).find((item) => item.code === journey.workTypeSlug)?.name;
    return fromCatalog ?? getJourneyWorkTypeLabel(journey);
  }, [journey, taxonomyCatalog?.workTypes]);

  if (!journey) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="container mx-auto max-w-3xl rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-lg font-semibold text-foreground">Guia no encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">Esta ruta no existe o fue movida.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/guias">Ir a guias</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <JourneyTemplate
      journey={journey}
      stageLabel={stageLabel}
      workTypeLabel={workTypeLabel}
      disciplineLabels={disciplineLabels}
      serviceLabels={serviceLabels}
      intakeHref={toJourneyIntakeHref(journey)}
      searchHref={toJourneySearchHref(journey)}
    />
  );
};

export default JourneyGuidePage;
