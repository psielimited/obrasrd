import { ImageOff, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ProofFirstCardProps {
  imageUrl?: string;
  imageAlt: string;
  title: string;
  stageLabel: string;
  disciplineLabel: string;
  locationLabel: string;
  providerNameLabel: string;
  trustContent?: ReactNode;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  topRightBadge?: ReactNode;
  onCardClick?: () => void;
  className?: string;
}

const ProofFirstCard = ({
  imageUrl,
  imageAlt,
  title,
  stageLabel,
  disciplineLabel,
  locationLabel,
  providerNameLabel,
  trustContent,
  primaryCta,
  secondaryCta,
  topRightBadge,
  onCardClick,
  className,
}: ProofFirstCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border bg-card transition-shadow duration-200 hover:obra-shadow-md",
        onCardClick ? "cursor-pointer" : "",
        className,
      )}
      onClick={onCardClick}
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-5 w-5" />
            <p className="text-xs font-medium">Sin imagen disponible</p>
          </div>
        )}

        {topRightBadge && <div className="absolute right-3 top-3">{topRightBadge}</div>}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-base font-black leading-tight text-foreground">{title}</h3>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            Etapa: {stageLabel}
          </Badge>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            Disciplina: {disciplineLabel}
          </Badge>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {locationLabel}
        </p>

        <p className="text-sm font-semibold text-foreground">{providerNameLabel}</p>

        <div className="min-h-6">{trustContent}</div>

        {(primaryCta || secondaryCta) && (
          <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
            {primaryCta}
            {secondaryCta}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProofFirstCard;
