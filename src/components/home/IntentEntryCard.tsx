import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";

interface IntentEntryCardProps {
  intentId: string;
  title: string;
  description: string;
  tags: string[];
  searchHref: string;
  journeyHref: string;
  journeyLabel: string;
  /** Optional decorative B&W avatar (small, ~64px). */
  avatarSrc?: string;
  avatarAlt?: string;
}

const IntentEntryCard = ({
  intentId,
  title,
  description,
  tags,
  searchHref,
  journeyHref,
  journeyLabel,
  avatarSrc,
  avatarAlt,
}: IntentEntryCardProps) => {
  const trackIntentClick = (cta: "search" | "journey") => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.HomepageIntentClick, {
      intent_id: intentId,
      cta,
    });
  };

  const onSearchIntentClick = () => {
    trackIntentClick("search");
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.HomepageSearchSubmitted, {
      source: "intent_card",
      target_href: searchHref,
    });
  };

  return (
    <Card className="h-full overflow-hidden border-border/70 bg-card/95 p-5 obra-shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Entrada por necesidad</p>
          <h3 className="text-lg font-black leading-tight text-foreground">{title}</h3>
        </div>
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={avatarAlt ?? ""}
            loading="lazy"
            decoding="async"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-cover grayscale ring-1 ring-border"
          />
        ) : null}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{description}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border/80 bg-muted/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        <Button asChild className="w-full justify-between" variant="accent">
          <Link to={searchHref} onClick={onSearchIntentClick}>
            Ver opciones
            <Search className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="w-full justify-between" variant="ghost">
          <Link to={journeyHref} onClick={() => trackIntentClick("journey")}>
            {journeyLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default IntentEntryCard;
