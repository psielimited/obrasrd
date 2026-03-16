import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/data/marketplace";
import { useNavigate } from "react-router-dom";
import CategoryTag from "@/components/marketplace/CategoryTag";
import MarketplaceVisualFrame from "@/components/marketplace/MarketplaceVisualFrame";
import TrustBadgeRow from "@/components/marketplace/TrustBadgeRow";
import { calculateProviderProfileCompleteness, getProviderTrustBadges } from "@/lib/provider-trust";

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();
  const trustBadges = getProviderTrustBadges(provider, {
    profileCompleteness: calculateProviderProfileCompleteness(provider),
  });

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar sus servicios de ${provider.trade}. Vi su perfil en ObrasRD.`,
  )}`;

  return (
    <div className="bg-card p-4 rounded-xl obra-shadow">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold text-foreground truncate cursor-pointer hover:underline"
            onClick={() => navigate(`/proveedor/${provider.id}`)}
          >
            {provider.name}
          </h3>
          <p className="text-xs text-muted-foreground">{provider.trade}</p>
        </div>
        <CategoryTag categorySlug={provider.categorySlug} />
      </div>

      <div className="mb-3">
        <MarketplaceVisualFrame
          categorySlug={provider.categorySlug}
          badgeRow={provider.isFeatured ? <span className="text-[10px] text-amber-300">Destacado</span> : null}
        >
          {provider.portfolioImages[0] ? (
            <img
              src={provider.portfolioImages[0]}
              alt={`Trabajo de ${provider.name}`}
              className="h-32 w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-32 grid place-items-center text-xs text-muted-foreground px-3 text-center">
              Sube fotos reales de tus trabajos para generar mas confianza.
            </div>
          )}
        </MarketplaceVisualFrame>
      </div>

      <div className="mb-3">
        <TrustBadgeRow badges={trustBadges} />
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {provider.location}
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 text-accent" />
          {provider.rating} ({provider.reviewCount})
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {provider.description}
      </p>

      <div className="flex gap-2">
        <Button
          variant="whatsapp"
          size="sm"
          className="flex-1"
          onClick={() => window.open(whatsappUrl, "_blank")}
        >
          Contactar por WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/proveedor/${provider.id}`)}
        >
          Ver perfil
        </Button>
      </div>
    </div>
  );
};

export default ProviderCard;
