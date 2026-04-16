import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CUSTOMER_JOURNEYS,
  getJourneyStageLabel,
  getJourneyWorkTypeLabel,
  toJourneyIntakeHref,
  toJourneySearchHref,
} from "@/lib/customer-journeys";

const JourneyGuidesPage = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <section className="border-b border-border px-4 py-8 md:py-10">
        <div className="container mx-auto max-w-5xl">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Guias por escenario
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
            Rutas practicas para proyectos reales en RD
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Elige tu caso y entra con etapa, disciplinas y servicios recomendados para tomar mejores decisiones.
          </p>
        </div>
      </section>

      <section className="px-4 py-6 md:py-8">
        <div className="container mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
          {CUSTOMER_JOURNEYS.map((journey) => (
            <Card key={journey.slug} className="border-border/80 bg-card p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {getJourneyStageLabel(journey)}
              </p>
              <h2 className="mt-1 text-lg font-black leading-tight text-foreground">{journey.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{journey.summary}</p>

              {getJourneyWorkTypeLabel(journey) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Tipo de obra: <span className="font-semibold text-foreground">{getJourneyWorkTypeLabel(journey)}</span>
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-between">
                  <Link to={`/guias/${journey.slug}`}>
                    Ver guia
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="ghost" size="sm" className="justify-start px-0">
                    <Link to={toJourneySearchHref(journey)}>Ver proveedores</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="justify-end px-0">
                    <Link to={toJourneyIntakeHref(journey)}>Iniciar solicitud</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default JourneyGuidesPage;
