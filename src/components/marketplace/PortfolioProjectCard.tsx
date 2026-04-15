import { Badge } from "@/components/ui/badge";
import type { ProviderPortfolioProject, ProviderTrustSnapshot } from "@/data/marketplace";
import { CalendarDays, MapPin } from "lucide-react";

interface PortfolioProjectCardProps {
  project: ProviderPortfolioProject;
  trustSnapshot?: ProviderTrustSnapshot;
}

const STATUS_LABELS: Record<string, string> = {
  planned: "Planificado",
  in_progress: "En ejecucion",
  completed: "Completado",
  on_hold: "En pausa",
  cancelled: "Cancelado",
};

const PortfolioProjectCard = ({ project, trustSnapshot }: PortfolioProjectCardProps) => {
  return (
    <div className="rounded-xl border border-[#E3DDD4] bg-[#F5F0E8] p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#1A1612]">{project.title}</p>
        {trustSnapshot?.projectRegistered && (
          <Badge variant="outline" className="border-[#D2C7B9] bg-white text-[#3D342B]">
            Proyecto registrado
          </Badge>
        )}
      </div>
      {project.summary && <p className="mt-1 text-xs text-[#5C5046]">{project.summary}</p>}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#7A6E64]">
        <span className="inline-flex items-center gap-1">
          <Badge variant="outline" className="border-[#D2C7B9] bg-white text-[#3D342B]">
            {STATUS_LABELS[project.status] ?? project.status}
          </Badge>
        </span>
        {project.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {project.location}
          </span>
        )}
        {project.completedOn && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(project.completedOn).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default PortfolioProjectCard;
