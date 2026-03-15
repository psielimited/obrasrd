import { Star, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Provider } from "@/data/marketplace";
import { useNavigate } from "react-router-dom";

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar sus servicios de ${provider.trade}. Vi su perfil en OBRA.`
  )}`;

  return (
    <div className="bg-card p-4 rounded-xl obra-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3
              className="text-sm font-bold text-foreground truncate cursor-pointer hover:underline"
              onClick={() => navigate(`/proveedor/${provider.id}`)}
            >
              {provider.name}
            </h3>
            {provider.verified && (
              <CheckCircle className="h-3.5 w-3.5 text-accent flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{provider.trade}</p>
        </div>
        {provider.startingPrice && (
          <span className="bg-muted text-foreground px-2 py-1 rounded text-xs font-bold font-tabular flex-shrink-0">
            RD${provider.startingPrice.toLocaleString()}+
          </span>
        )}
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
