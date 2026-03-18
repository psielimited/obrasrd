import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/data/marketplace";
import { useNavigate } from "react-router-dom";
import { getCategoryTheme } from "@/lib/category-theme";
import {
  calculateProviderProfileCompleteness,
  getProviderTrustBadges,
  isProviderActive,
} from "@/lib/provider-trust";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: Provider;
}

/* ── Star rating helper ── */
const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars: ("full" | "half" | "empty")[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push("full");
    else if (i === full && hasHalf) stars.push("half");
    else stars.push("empty");
  }
  return (
    <span className="inline-flex gap-px">
      {stars.map((s, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            s === "full" && "fill-accent text-accent",
            s === "half" && "fill-accent/40 text-accent",
            s === "empty" && "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
};

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const navigate = useNavigate();
  const theme = getCategoryTheme(provider.categorySlug);
  const active = isProviderActive(provider, {
    profileCompleteness: calculateProviderProfileCompleteness(provider),
  });
  const trustBadges = getProviderTrustBadges(provider, {
    profileCompleteness: calculateProviderProfileCompleteness(provider),
  });

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar sus servicios de ${provider.trade}. Vi su perfil en ObrasRD.`,
  )}`;

  const photoCount = provider.portfolioImages.length;

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      onClick={() => navigate(`/proveedor/${provider.id}`)}
    >
      {/* ── Photo hero ── */}
      <div className="relative h-[190px] overflow-hidden bg-foreground/90">
        {provider.portfolioImages[0] ? (
          <img
            src={provider.portfolioImages[0]}
            alt={`Trabajo de ${provider.name}`}
            className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04] group-hover:opacity-90"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-xs text-muted-foreground/60">
            Sin fotos de proyecto
          </div>
        )}

        {/* Gradient scrim */}
        <div className="card-photo-scrim" />

        {/* Category pill — top left */}
        <span
          className={cn(
            "absolute top-3.5 left-3.5 rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]",
            theme.pillClassName,
          )}
        >
          {theme.label}
        </span>

        {/* Active status — top right */}
        {active && (
          <span className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-full bg-foreground/45 backdrop-blur-sm px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-whatsapp" />
            <span className="text-[10px] font-medium text-background/85">Activo</span>
          </span>
        )}

        {/* Photo pagination dots */}
        {photoCount > 1 && (
          <div className="absolute bottom-[60px] right-3.5 flex gap-1">
            {Array.from({ length: Math.min(photoCount, 5) }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-[5px] w-[5px] rounded-full",
                  i === 0 ? "bg-background" : "bg-background/40",
                )}
              />
            ))}
          </div>
        )}

        {/* Provider identity */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-3">
          <h3 className="text-lg font-extrabold leading-tight text-background tracking-tight">
            {provider.name}
          </h3>
          <p className="text-[11px] italic text-background/65 mt-0.5">{provider.trade}</p>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="px-4 pb-5 pt-4" onClick={(e) => e.stopPropagation()}>
        {/* Meta row */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-border">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {provider.location}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{provider.rating}</span>
            <StarRating rating={provider.rating} />
            <span className="text-[11px] text-muted-foreground">({provider.reviewCount})</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-[13px] text-muted-foreground leading-relaxed mb-3.5 line-clamp-2">
          {provider.description}
        </p>

        {/* Trust chips */}
        {trustBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {trustBadges.includes("verified") && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                ✓ Verificado
              </span>
            )}
            {trustBadges.includes("registered_project") && (
              <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Proyecto registrado
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-foreground text-background hover:bg-foreground/80 rounded-lg uppercase tracking-widest text-[11px] font-bold gap-2"
            onClick={() => window.open(whatsappUrl, "_blank")}
          >
            <span className="h-[7px] w-[7px] rounded-full bg-whatsapp shadow-[0_0_0_2px_hsl(var(--whatsapp)/0.25)]" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg uppercase tracking-widest text-[11px] font-bold hover:border-accent hover:text-accent"
            onClick={() => navigate(`/proveedor/${provider.id}`)}
          >
            Ver perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
