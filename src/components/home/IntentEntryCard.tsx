import { ArrowRight, ClipboardList, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface IntentEntryCardProps {
  title: string;
  description: string;
  tags: string[];
  searchHref: string;
  intakeHref: string;
  journeyHref: string;
  journeyLabel: string;
}

const IntentEntryCard = ({
  title,
  description,
  tags,
  searchHref,
  intakeHref,
  journeyHref,
  journeyLabel,
}: IntentEntryCardProps) => {
  return (
    <Card className="h-full overflow-hidden border-border/70 bg-card/95 p-5 obra-shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Entrada por necesidad</p>
          <h3 className="text-lg font-black leading-tight text-foreground">{title}</h3>
        </div>
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
          <Link to={searchHref}>
            Ver opciones
            <Search className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="w-full justify-between" variant="outline">
          <Link to={intakeHref}>
            Iniciar solicitud
            <ClipboardList className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild className="w-full justify-between" variant="ghost">
          <Link to={journeyHref}>
            {journeyLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};

export default IntentEntryCard;
