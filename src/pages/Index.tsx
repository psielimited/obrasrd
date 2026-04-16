import { useEffect } from "react";
import { ShieldCheck, Wrench } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import HowItWorks from "@/components/HowItWorks";
import IntentEntryCard from "@/components/home/IntentEntryCard";
import StageExplainerSection from "@/components/home/StageExplainerSection";
import ProviderCard from "@/components/ProviderCard";
import { Button } from "@/components/ui/button";
import { useFeaturedProviders, usePhases } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";

interface IntentDefinition {
  id: string;
  title: string;
  description: string;
  tags: string[];
  searchHref: string;
  intakeHref: string;
  journeyLabel: string;
  journeyHref: string;
}

const INTENT_DEFINITIONS: IntentDefinition[] = [
  {
    id: "construir",
    title: "Voy a construir",
    description: "Necesito equipos para arrancar una obra nueva con plan claro y ejecucion segura.",
    tags: ["obra nueva", "estructura", "contratistas"],
    searchHref: "/buscar?categoria=construccion&q=construccion",
    intakeHref: "/proyectos?intencion=construir",
    journeyLabel: "Ver guia: casa desde cero",
    journeyHref: "/guias/construir-casa-desde-cero",
  },
  {
    id: "remodelar",
    title: "Voy a remodelar",
    description: "Quiero renovar espacios sin improvisar presupuesto, tiempos ni acabados.",
    tags: ["interiores", "acabados", "reforma"],
    searchHref: "/buscar?categoria=remodelacion_de_cocina&q=remodelacion",
    intakeHref: "/proyectos?intencion=remodelar",
    journeyLabel: "Ver guia: cocina y bano",
    journeyHref: "/guias/remodelar-cocina-bano",
  },
  {
    id: "diseno",
    title: "Necesito diseno",
    description: "Busco arquitectura o ingenieria para definir el proyecto antes de construir.",
    tags: ["arquitectura", "ingenieria", "planos"],
    searchHref: "/buscar?categoria=planificacion&q=diseno",
    intakeHref: "/proyectos?intencion=diseno",
    journeyLabel: "Ver guia: planos y permisos",
    journeyHref: "/guias/planos-y-permisos",
  },
  {
    id: "supervision",
    title: "Necesito supervision",
    description: "Quiero control tecnico de obra para reducir riesgos, retrabajos y sobrecostos.",
    tags: ["control de obra", "calidad", "gerencia"],
    searchHref: "/buscar?categoria=supervision_de_obra&q=supervision",
    intakeHref: "/proyectos?intencion=supervision",
    journeyLabel: "Ver guia: supervision de obra",
    journeyHref: "/guias/supervision-de-obra",
  },
  {
    id: "mantenimiento",
    title: "Necesito mantenimiento",
    description: "Busco servicios para mantener la propiedad operativa y prevenir fallas.",
    tags: ["preventivo", "correctivo", "diagnostico"],
    searchHref: "/buscar?categoria=mantenimiento&q=mantenimiento",
    intakeHref: "/proyectos?intencion=mantenimiento",
    journeyLabel: "Ver guia: mantenimiento",
    journeyHref: "/guias/mantenimiento-inmueble",
  },
  {
    id: "materiales",
    title: "Necesito materiales o suplidores",
    description: "Quiero comparar suplidores y materiales para comprar con confianza.",
    tags: ["suplidores", "materiales", "logistica"],
    searchHref: "/buscar?categoria=materiales&q=materiales",
    intakeHref: "/proyectos?intencion=materiales",
    journeyLabel: "Ir al catalogo de materiales",
    journeyHref: "/materiales",
  },
];

const resolvePhaseHref = (phaseSlug: string, phaseExists: boolean, fallbackHref: string) =>
  phaseExists ? `/fase/${phaseSlug}` : fallbackHref;

const Index = () => {
  const location = useLocation();
  const { data: providers = [] } = useFeaturedProviders(4);
  const { data: phases = [] } = usePhases();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();

  const featuredProviders = providers.slice(0, 4);
  const phaseSlugSet = new Set(phases.map((phase) => phase.slug));

  const intentCards = INTENT_DEFINITIONS;

  const planningHref = resolvePhaseHref("planificacion", phaseSlugSet.has("planificacion"), "/buscar?categoria=planificacion");
  const constructionHref = resolvePhaseHref("construccion", phaseSlugSet.has("construccion"), "/buscar?categoria=construccion");
  const maintenanceHref = resolvePhaseHref("mantenimiento", phaseSlugSet.has("mantenimiento"), "/buscar?categoria=mantenimiento");

  useEffect(() => {
    if (!location.hash) return;
    const anchorId = location.hash.replace("#", "");
    const target = document.getElementById(anchorId);
    if (!target) return;

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.hash]);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <section className="relative overflow-hidden border-b border-border bg-foreground px-4 py-12 text-background md:py-16">
        <img
          aria-hidden
          src="/hero-doodle-kids.svg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-bottom opacity-[0.17] mix-blend-luminosity pointer-events-none select-none"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,137,64,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_42%)]" />
        <div className="container relative mx-auto max-w-5xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background/60">ObrasRD - Republica Dominicana</p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Entra por lo que necesitas hacer en tu proyecto, no por categorias genericas.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/80 md:text-base">
            Selecciona tu necesidad, recibe opciones filtradas y arranca con una ruta clara de planificacion, construccion o mantenimiento.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="accent" size="lg" className="sm:w-auto">
              <Link to="/#entradas-intencion">Empezar por necesidad</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background sm:w-auto">
              <Link to="/proyectos">Crear solicitud de proyecto</Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-background/15 bg-background/5 p-3">
              <p className="mb-1 flex items-center gap-2 font-semibold text-background">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Contratacion con criterio tecnico
              </p>
              <p className="text-background/75">Perfiles y rutas pensadas para decisiones de obra mas seguras.</p>
            </div>
            <div className="rounded-lg border border-background/15 bg-background/5 p-3">
              <p className="mb-1 flex items-center gap-2 font-semibold text-background">
                <Wrench className="h-4 w-4 text-accent" />
                Flujo practico para obra real
              </p>
              <p className="text-background/75">De la primera busqueda al seguimiento del proyecto en un solo flujo.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="entradas-intencion" className="px-4 py-10 md:py-14">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Entrada principal</p>
              <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Elige tu necesidad y entra directo</h2>
            </div>
            <Button asChild variant="ghost" className="justify-start md:justify-center">
              <Link to="/buscar">Ver todas las opciones</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {intentCards.map((intent) => (
              <IntentEntryCard
                key={intent.id}
                intentId={intent.id}
                title={intent.title}
                description={intent.description}
                tags={intent.tags}
                searchHref={intent.searchHref}
                intakeHref={intent.intakeHref}
                journeyHref={intent.journeyHref}
                journeyLabel={intent.journeyLabel}
              />
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Escenarios comunes</p>
            <div className="mt-2 flex flex-col gap-1.5 text-sm md:flex-row md:flex-wrap md:gap-3">
              <Link to="/guias/construir-casa-desde-cero" className="text-foreground/90 transition-colors hover:text-foreground">
                Construir casa desde cero
              </Link>
              <Link to="/guias/remodelar-cocina-bano" className="text-foreground/90 transition-colors hover:text-foreground">
                Remodelar cocina y bano
              </Link>
              <Link to="/guias/resolver-filtracion" className="text-foreground/90 transition-colors hover:text-foreground">
                Resolver filtracion
              </Link>
              <Link to="/guias/planos-y-permisos" className="text-foreground/90 transition-colors hover:text-foreground">
                Planos y permisos
              </Link>
              <Link to="/guias/supervision-de-obra" className="text-foreground/90 transition-colors hover:text-foreground">
                Supervision de obra
              </Link>
              <Link to="/guias/mantenimiento-inmueble" className="text-foreground/90 transition-colors hover:text-foreground">
                Mantenimiento de inmueble
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StageExplainerSection
        planningHref={planningHref}
        constructionHref={constructionHref}
        maintenanceHref={maintenanceHref}
      />

      <section id="proveedores-destacados" className="px-4 py-8 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Proveedores destacados</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {featuredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                phases={phases}
                taxonomyCatalog={taxonomyCatalog}
              />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <footer className="border-t border-border px-4 py-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-black tracking-tight text-foreground">ObrasRD</p>
              <p className="mt-1 text-xs text-muted-foreground">Marketplace de construccion para Republica Dominicana.</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Explorar</p>
              <div className="space-y-1 text-sm">
                <Link to="/buscar" className="block text-muted-foreground transition-colors hover:text-foreground">Buscar servicios</Link>
                <Link to="/proyectos" className="block text-muted-foreground transition-colors hover:text-foreground">Publicar proyecto</Link>
                <Link to="/buscar?tab=servicios" className="block text-muted-foreground transition-colors hover:text-foreground">Proveedores</Link>
                <Link to="/materiales" className="block text-muted-foreground transition-colors hover:text-foreground">Materiales / Suplidores</Link>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Etapas</p>
              <div className="space-y-1 text-sm">
                <Link to={planningHref} className="block text-muted-foreground transition-colors hover:text-foreground">Planificacion</Link>
                <Link to={constructionHref} className="block text-muted-foreground transition-colors hover:text-foreground">Construccion</Link>
                <Link to={maintenanceHref} className="block text-muted-foreground transition-colors hover:text-foreground">Mantenimiento</Link>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Recursos</p>
              <div className="space-y-1 text-sm">
                <Link to="/#como-funciona" className="block text-muted-foreground transition-colors hover:text-foreground">Como funciona</Link>
                <Link to="/guias" className="block text-muted-foreground transition-colors hover:text-foreground">Guias por escenario</Link>
                <Link to="/publicar" className="block text-muted-foreground transition-colors hover:text-foreground">Soy proveedor</Link>
                <Link to="/precios" className="block text-muted-foreground transition-colors hover:text-foreground">Planes</Link>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">(c) 2026 ObrasRD. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
