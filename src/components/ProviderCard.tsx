import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TrustBadge from "@/components/marketplace/TrustBadge";
import ProofFirstCard from "@/components/marketplace/ProofFirstCard";
import { usePhases } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import type { Provider } from "@/data/marketplace";
import {
  calculateProviderProfileCompleteness,
  getProviderTrustBadges,
} from "@/lib/provider-trust";
import { getLegacyCategoryDisplayFallback } from "@/lib/legacy-taxonomy-compat";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { deriveProvinceFromText } from "@/lib/analytics/province";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { useNavigate } from "react-router-dom";

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();
  const { data: phases = [] } = usePhases();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();

  const phase = phases.find((item) => item.id === provider.phaseId);
  const discipline = taxonomyCatalog?.disciplines.find((item) => item.id === provider.primaryDisciplineId);
  const workTypes = taxonomyCatalog?.workTypes ?? [];
  const fallback = getLegacyCategoryDisplayFallback(provider.categorySlug);

  const stageLabel = phase?.name || fallback?.stageLabel || "Sin etapa";
  const disciplineLabel = discipline?.name || fallback?.disciplineLabel || "Sin disciplina";
  const workTypeLabel =
    (provider.workTypeIds ?? [])
      .map((id) => workTypes.find((item) => item.id === id)?.name)
      .find(Boolean) ||
    fallback?.workTypeLabel;

  const trustBadges = getProviderTrustBadges(provider, {
    profileCompleteness: calculateProviderProfileCompleteness(provider),
  });

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar ${provider.trade}. Vi su perfil en ObrasRD.`,
  )}`;

  const analyticsMeta = {
    provider_id: provider.id,
    stage_id: provider.phaseId,
    discipline_id: provider.primaryDisciplineId,
    service_id: provider.primaryServiceId,
    work_type_id: provider.workTypeIds?.[0],
    province: deriveProvinceFromText(provider.city || provider.location),
  };

  const trackProviderViewed = (source: "provider_card" | "search_results") => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ProviderViewed, {
      source,
      ...analyticsMeta,
    });
  };

  const onOpenProfile = () => {
    trackProviderViewed("provider_card");
    navigate(`/proveedor/${provider.id}`);
  };

  const onContactViaWhatsapp = () => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ProviderContacted, {
      source: "provider_card",
      method: "whatsapp",
      ...analyticsMeta,
    });
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <ProofFirstCard
      imageUrl={provider.portfolioImages[0]}
      imageAlt={`Trabajo de ${provider.name}`}
      title={provider.trade}
      stageLabel={stageLabel}
      disciplineLabel={disciplineLabel}
      workTypeLabel={workTypeLabel}
      locationLabel={provider.location || provider.city || "Ubicacion no indicada"}
      providerNameLabel={provider.name}
      onCardClick={onOpenProfile}
      topRightBadge={provider.isFeatured ? <Badge className="bg-accent text-accent-foreground">Destacado (Plan)</Badge> : undefined}
      trustContent={
        trustBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {trustBadges.map((badge) => (
              <TrustBadge key={badge} type={badge} className="px-2 py-0.5 text-[10px]" />
            ))}
          </div>
        ) : (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Sin insignias de confianza verificadas
          </Badge>
        )
      }
      primaryCta={
        <Button className="flex-1" size="sm" onClick={onContactViaWhatsapp}>
          Cotizar
        </Button>
      }
      secondaryCta={
        <Button variant="outline" size="sm" onClick={onOpenProfile}>
          Ver perfil
        </Button>
      }
    />
  );
};

export default ProviderCard;
