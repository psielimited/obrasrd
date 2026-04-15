import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProofFirstCard from "@/components/marketplace/ProofFirstCard";

interface ProjectPhaseCardProps {
  phaseId: number;
  phaseName: string;
  description: string;
  disciplineLabel: string;
  selected: boolean;
  onToggle: () => void;
}

const ProjectPhaseCard = ({
  phaseId,
  phaseName,
  description,
  disciplineLabel,
  selected,
  onToggle,
}: ProjectPhaseCardProps) => {
  return (
    <ProofFirstCard
      title={phaseName}
      imageAlt={phaseName}
      stageLabel={`Fase ${String(phaseId).padStart(2, "0")}`}
      disciplineLabel={disciplineLabel || "Sin disciplina"}
      locationLabel="Republica Dominicana"
      providerNameLabel={description}
      trustContent={
        <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
          Plan editable
        </Badge>
      }
      primaryCta={
        <Button className="flex-1" size="sm" variant={selected ? "default" : "outline"} onClick={onToggle}>
          {selected ? "Seleccionada" : "Seleccionar"}
        </Button>
      }
      secondaryCta={
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {selected ? "Quitar" : "Agregar"}
        </Button>
      }
      className={selected ? "ring-2 ring-accent/60" : undefined}
    />
  );
};

export default ProjectPhaseCard;
