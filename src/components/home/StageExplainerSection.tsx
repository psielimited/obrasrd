import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface StageExplainerSectionProps {
  planningHref: string;
  constructionHref: string;
  maintenanceHref: string;
}

const StageExplainerSection = ({ planningHref, constructionHref, maintenanceHref }: StageExplainerSectionProps) => {
  const stages = [
    {
      id: "01",
      title: "Planificacion",
      description: "Define alcance, presupuesto, permisos y diseno tecnico antes de contratar ejecucion.",
      href: planningHref,
      cta: "Ver etapa de planificacion",
    },
    {
      id: "02",
      title: "Construccion",
      description: "Coordina contratistas, supervisa avances y controla calidad, tiempos y costos de obra.",
      href: constructionHref,
      cta: "Ver etapa de construccion",
    },
    {
      id: "03",
      title: "Mantenimiento",
      description: "Programa mantenimientos y correcciones para proteger la inversion y evitar riesgos.",
      href: maintenanceHref,
      cta: "Ver etapa de mantenimiento",
    },
  ] as const;

  return (
    <section id="guias" className="px-4 py-10 md:py-14">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Conocimiento del sector</p>
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Entiende cada etapa antes de contratar</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stages.map((stage) => (
            <Card key={stage.id} className="h-full border-border/70 bg-card p-5 obra-shadow">
              <p className="mb-3 text-2xl font-black leading-none text-accent/80">{stage.id}</p>
              <h3 className="mb-2 text-lg font-extrabold text-foreground">{stage.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{stage.description}</p>
              <Button asChild variant="ghost" className="justify-start px-0 text-sm">
                <Link to={stage.href}>
                  {stage.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StageExplainerSection;
