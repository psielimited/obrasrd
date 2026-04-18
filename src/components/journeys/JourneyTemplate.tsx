import { ArrowLeft, ArrowRight, ClipboardList, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Provider } from "@/data/marketplace";
import type { CustomerJourneyDefinition } from "@/lib/customer-journeys";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

interface TopicDirectoryLink {
  label: string;
  href: string;
  ctaType: "ver_empresas_relacionadas" | "buscar_este_servicio" | "ver_categoria_relacionada";
}

interface JourneyTemplateProps {
  journey: CustomerJourneyDefinition;
  stageLabel: string;
  resourceTypeLabel: string;
  dominicanContextNote: string;
  workTypeLabel?: string;
  disciplineLabels: string[];
  serviceLabels: string[];
  intakeHref: string;
  searchHref: string;
  topicDirectoryLinks: TopicDirectoryLink[];
  relatedProviders: Pick<Provider, "id" | "name" | "trade" | "city" | "location" | "verified">[];
  onContentDirectoryClick: (payload: { ctaType: TopicDirectoryLink["ctaType"] | "ver_proveedor_relacionado"; href: string }) => void;
}

const JourneyTemplate = ({
  journey,
  stageLabel,
  resourceTypeLabel,
  dominicanContextNote,
  workTypeLabel,
  disciplineLabels,
  serviceLabels,
  intakeHref,
  searchHref,
  topicDirectoryLinks,
  relatedProviders,
  onContentDirectoryClick,
}: JourneyTemplateProps) => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="px-4 py-6 md:py-8">
        <div className="container mx-auto max-w-4xl">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to={PUBLIC_ROUTES.conocimiento}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Ver todo el conocimiento
            </Link>
          </Button>

          <Card className="border-border/80 bg-card p-5 md:p-6">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Archivo de conocimiento</p>
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{journey.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{journey.summary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Etapa: {stageLabel}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Recurso: {resourceTypeLabel}
              </Badge>
              {workTypeLabel && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                  Tipo de obra: {workTypeLabel}
                </Badge>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Disciplinas relacionadas
                </p>
                <div className="flex flex-wrap gap-2">
                  {disciplineLabels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Servicios recomendados
                </p>
                <div className="flex flex-wrap gap-2">
                  {serviceLabels.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Contexto dominicano</p>
              <p className="mt-1 text-sm text-foreground">{dominicanContextNote}</p>
            </div>
          </Card>

          <Card className="mt-4 border-border/80 bg-card p-5 md:p-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Que preparar antes de contactar
            </p>
            <ul className="space-y-2 text-sm text-foreground">
              {journey.preparationChecklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1 justify-between" variant="outline">
              <Link
                to={searchHref}
                onClick={() =>
                  onContentDirectoryClick({
                    ctaType: "ver_empresas_relacionadas",
                    href: searchHref,
                  })
                }
              >
                Ver proveedores filtrados
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="flex-1 justify-between" variant="ghost">
              <Link to={intakeHref}>
                Iniciar solicitud guiada
                <ClipboardList className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {topicDirectoryLinks.length > 0 && (
            <Card className="mt-4 border-border/80 bg-card p-5 md:p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Siguientes acciones utiles</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {topicDirectoryLinks.map((item) => (
                  <Button key={item.href} asChild variant="outline" size="sm" className="justify-between">
                    <Link
                      to={item.href}
                      onClick={() =>
                        onContentDirectoryClick({
                          ctaType: item.ctaType,
                          href: item.href,
                        })
                      }
                    >
                      {item.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {relatedProviders.length > 0 && (
            <Card className="mt-4 border-border/80 bg-card p-5 md:p-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Empresas relacionadas</p>
              <div className="grid gap-3 md:grid-cols-2">
                {relatedProviders.map((provider) => (
                  <div key={provider.id} className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-sm font-semibold text-foreground">{provider.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{provider.trade}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{provider.city || provider.location || "Republica Dominicana"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {provider.verified && (
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                          Verificado
                        </Badge>
                      )}
                      <Button asChild size="sm" variant="ghost" className="h-7 px-0 text-xs">
                        <Link
                          to={`/proveedor/${provider.id}`}
                          onClick={() =>
                            onContentDirectoryClick({
                              ctaType: "ver_proveedor_relacionado",
                              href: `/proveedor/${provider.id}`,
                            })
                          }
                        >
                          Ver perfil
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button asChild variant="ghost" className="mt-2 w-full justify-between sm:w-auto">
            <Link to="/proyectos">
              Prefiero describir mi caso desde cero
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JourneyTemplate;
