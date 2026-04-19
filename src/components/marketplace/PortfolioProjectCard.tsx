import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProviderPortfolioProject, ProviderTrustSnapshot } from "@/data/marketplace";
import { ImageOff, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface PortfolioProjectCardProps {
  project: ProviderPortfolioProject;
  trustSnapshot?: ProviderTrustSnapshot;
  providerName?: string;
  providerId?: string;
  projectHref?: string;
  imageUrl?: string;
  stageLabel?: string;
  categoryLabel?: string;
  locationLabel?: string;
  workTypeLabel?: string;
}

const STATUS_LABELS: Record<string, string> = {
  planned: "Planificado",
  in_progress: "En ejecucion",
  completed: "Completado",
  on_hold: "En pausa",
  cancelled: "Cancelado",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-DO", { year: "numeric", month: "short", day: "numeric" });

const PortfolioProjectCard = ({
  project,
  trustSnapshot,
  providerName,
  providerId,
  projectHref,
  imageUrl,
  stageLabel,
  categoryLabel,
  locationLabel,
  workTypeLabel,
}: PortfolioProjectCardProps) => {
  const rootClassName = "group overflow-hidden rounded-xl border border-[#E3DDD4] bg-[#F5F0E8]";
  const targetHref = projectHref ?? `/proyectos/reales/${project.id}`;
  const resolvedLocation = locationLabel || project.location;
  const statusLabel = STATUS_LABELS[project.status] ?? project.status;

  const cardContent = (
    <>
      <div className="relative h-44 overflow-hidden bg-[#E9E1D6]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${project.title} - ${providerName || "Proyecto real"}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#7A6E64]">
            <ImageOff className="h-5 w-5" />
            <p className="text-xs font-medium">Sin foto disponible</p>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className="border-[#D2C7B9] bg-white text-[#3D342B]">
            {statusLabel}
          </Badge>
          {project.isFeatured && (
            <Badge variant="outline" className="border-emerald-500/35 bg-emerald-50 text-emerald-700">
              Destacado
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3 p-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-snug text-[#1A1612]">{project.title}</p>
        </div>

        {stageLabel && (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="border-[#D2C7B9] bg-white text-[#3D342B]">
              Etapa: {stageLabel}
            </Badge>
          </div>
        )}

        {resolvedLocation && (
          <p className="inline-flex items-center gap-1.5 text-xs text-[#7A6E64]">
            <MapPin className="h-3.5 w-3.5" />
            {resolvedLocation}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs">
            <Link to={targetHref}>Ver detalle</Link>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <article className={rootClassName}>{cardContent}</article>
  );
};

export default PortfolioProjectCard;
