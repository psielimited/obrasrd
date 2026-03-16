import { MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Material } from "@/data/marketplace";

interface MaterialCardProps {
  material: Material;
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const whatsappUrl = `https://wa.me/${material.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar: ${material.name}. Vi el producto en ObrasRD.`
  )}`;

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 obra-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">{material.name}</h3>
          <p className="text-xs text-muted-foreground">{material.supplier}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 bg-muted rounded uppercase tracking-wide text-muted-foreground flex-shrink-0">
          {material.category}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {material.location}
        </span>
        {material.delivery && (
          <span className="flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Delivery
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-lg font-bold text-foreground font-tabular">
          RD${material.price.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">/ {material.unit}</span>
      </div>

      {material.bulkPrice && (
        <p className="text-xs text-accent font-semibold mb-3">
          RD${material.bulkPrice.toLocaleString()} / {material.unit} ({material.bulkUnit})
        </p>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {material.description}
      </p>

      <Button
        variant="whatsapp"
        size="sm"
        className="w-full"
        onClick={() => window.open(whatsappUrl, "_blank")}
      >
        Contactar por WhatsApp
      </Button>
    </div>
  );
};

export default MaterialCard;
