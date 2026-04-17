import { useEffect, useState } from "react";
import { BookOpen, Building2, Search } from "lucide-react";
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
    journeyLabel: "Ver guia: casa desde cero",
    journeyHref: "/guias/construir-casa-desde-cero",
  },
  {
    id: "remodelar",
    title: "Voy a remodelar",
    description: "Quiero renovar espacios sin improvisar presupuesto, tiempos ni acabados.",
    tags: ["interiores", "acabados", "reforma"],
    searchHref: "/buscar?categoria=remodelacion_de_cocina&q=remodelacion",
    journeyLabel: "Ver guia: cocina y bano",
    journeyHref: "/guias/remodelar-cocina-bano",
  },
  {
    id: "diseno",
    title: "Necesito diseno",
    description: "Busco arquitectura o ingenieria para definir el proyecto antes de construir.",
    tags: ["arquitectura", "ingenieria", "planos"],
    searchHref: "/buscar?categoria=planificacion&q=diseno",
    journeyLabel: "Ver guia: planos y permisos",
    journeyHref: "/guias/planos-y-permisos",
  },
  {
    id: "supervision",
    title: "Necesito supervision",
    description: "Quiero control tecnico de obra para reducir riesgos, retrabajos y sobrecostos.",
    tags: ["control de obra", "calidad", "gerencia"],
    searchHref: "/buscar?categoria=supervision_de_obra&q=supervision",
    journeyLabel: "Ver guia: supervision de obra",
    journeyHref: "/guias/supervision-de-obra",
  },
  {
    id: "mantenimiento",
    title: "Necesito mantenimiento",
    description: "Busco servicios para mantener la propiedad operativa y prevenir fallas.",
    tags: ["preventivo", "correctivo", "diagnostico"],
    searchHref: "/buscar?categoria=mantenimiento&q=mantenimiento",
    journeyLabel: "Ver guia: mantenimiento",
    journeyHref: "/guias/mantenimiento-inmueble",
  },
  {
    id: "materiales",
    title: "Necesito materiales o suplidores",
    description: "Quiero comparar suplidores y materiales para comprar con confianza.",
    tags: ["suplidores", "materiales", "logistica"],
    searchHref: "/buscar?categoria=materiales&q=materiales",
    journeyLabel: "Ir al catalogo de materiales",
    journeyHref: "/materiales",
  },
];

const resolvePhaseHref = (phaseSlug: string, phaseExists: boolean, fallbackHref: string) =>
  phaseExists ? `/fase/${phaseSlug}` : fallbackHref;

const Index = () => {
  const location = useLocation();
  const [shouldLoadDeferredData, setShouldLoadDeferredData] = useState(false);
  const { data: providers = [] } = useFeaturedProviders(4, shouldLoadDeferredData);
  const { data: phases = [] } = usePhases(shouldLoadDeferredData);
  const { data: taxonomyCatalog } = useTaxonomyCatalog(shouldLoadDeferredData);

  const featuredProviders = providers.slice(0, 4);
  const phaseSlugSet = new Set(phases.map((phase) => phase.slug));

  const intentCards = INTENT_DEFINITIONS.slice(0, 4);

  const planningHref = resolvePhaseHref("planificacion", phaseSlugSet.has("planificacion"), "/buscar?categoria=planificacion");
  const constructionHref = resolvePhaseHref("construccion", phaseSlugSet.has("construccion"), "/buscar?categoria=construccion");
  const maintenanceHref = resolvePhaseHref("mantenimiento", phaseSlugSet.has("mantenimiento"), "/buscar?categoria=mantenimiento");

  useEffect(() => {
    let animationFrameId = 0;
    let nestedAnimationFrameId = 0;

    animationFrameId = window.requestAnimationFrame(() => {
      nestedAnimationFrameId = window.requestAnimationFrame(() => {
        setShouldLoadDeferredData(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.cancelAnimationFrame(nestedAnimationFrameId);
    };
  }, []);

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
            Busca servicios, conecta con profesionales y avanza tu obra con criterio.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/80 md:text-base">
            Marketplace dominicano para construccion: descubre opciones confiables, registra tu empresa y consulta guias del sector en un mismo lugar.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="accent" size="lg" className="sm:w-auto">
              <Link to="/buscar">Buscar servicios</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background sm:w-auto">
              <Link to="/publicar">Registrar empresa</Link>
            </Button>
          </div>

          <div className="mt-4">
            <Link
              to="/guias"
              className="inline-flex text-sm font-semibold text-background/80 transition-colors hover:text-background"
            >
              Ver guias y conocimiento del sector
            </Link>
          </div>
        </div>
      </section>

      <section id="acciones-principales" className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Que puedes hacer en ObrasRD</p>
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Tres caminos claros para arrancar hoy</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-border bg-card p-5 obra-shadow">
              <p className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <Search className="h-5 w-5" />
              </p>
              <h3 className="text-lg font-black tracking-tight text-foreground">1) Buscar servicios o profesionales</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Compara opciones por especialidad, etapa y ubicacion para cotizar con mas claridad.
              </p>
              <Button asChild className="mt-4 w-full" variant="accent">
                <Link to="/buscar">Buscar servicios</Link>
              </Button>
            </article>

            <article className="rounded-xl border border-border bg-card p-5 obra-shadow">
              <p className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <Building2 className="h-5 w-5" />
              </p>
              <h3 className="text-lg font-black tracking-tight text-foreground">2) Registrar o promocionar tu empresa</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Muestra tus servicios y aumenta tu visibilidad ante clientes listos para contratar.
              </p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link to="/publicar">Registrar empresa</Link>
              </Button>
            </article>

            <article className="rounded-xl border border-border bg-card p-5 obra-shadow">
              <p className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                <BookOpen className="h-5 w-5" />
              </p>
              <h3 className="text-lg font-black tracking-tight text-foreground">3) Acceder a conocimiento del sector</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Consulta guias por escenario para planificar mejor y tomar decisiones tecnicas con contexto.
              </p>
              <Button asChild className="mt-4 w-full" variant="ghost">
                <Link to="/guias">Ver guias</Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section id="entradas-intencion" className="px-4 pb-10 md:pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Explora por necesidad</p>
              <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Empieza por tu tipo de proyecto</h2>
            </div>
            <Button asChild variant="ghost" className="justify-start md:justify-center">
              <Link to="/buscar">Ver todo en buscador</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {intentCards.map((intent) => (
              <IntentEntryCard
                key={intent.id}
                intentId={intent.id}
                title={intent.title}
                description={intent.description}
                tags={intent.tags}
                searchHref={intent.searchHref}
                journeyHref={intent.journeyHref}
                journeyLabel={intent.journeyLabel}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="proveedores-destacados" className="px-4 py-8 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Profesionales y empresas destacadas</h2>
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

      <StageExplainerSection
        planningHref={planningHref}
        constructionHref={constructionHref}
        maintenanceHref={maintenanceHref}
      />

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
