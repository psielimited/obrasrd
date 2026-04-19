import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  HardHat,
  Hammer,
  ClipboardCheck,
  Plug,
  Wrench,
  ShieldCheck,
  Package,
  Search,
  type LucideIcon,
} from "lucide-react";
import StageExplainerSection from "@/components/home/StageExplainerSection";
import ProviderCard from "@/components/ProviderCard";
import PortfolioProjectCard from "@/components/marketplace/PortfolioProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeaturedPortfolioProjects, useFeaturedProviders, usePhases } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

const SHORTCUT_ICON_MAP: Record<string, LucideIcon> = {
  arquitectura: Compass,
  ingenieria_civil: HardHat,
  ingenieria: HardHat,
  construccion_ejecucion: Hammer,
  construccion: Hammer,
  supervision_gerencia: ClipboardCheck,
  supervision: ClipboardCheck,
  instalaciones_especiales: Plug,
  instalaciones: Plug,
  mantenimiento_preventivo: Wrench,
  mantenimiento: Wrench,
  seguridad_salud: ShieldCheck,
  seguridad: ShieldCheck,
  materiales: Package,
};

const getShortcutIcon = (slug: string): LucideIcon => {
  if (SHORTCUT_ICON_MAP[slug]) return SHORTCUT_ICON_MAP[slug];
  const matchKey = Object.keys(SHORTCUT_ICON_MAP).find((key) => slug.includes(key));
  return matchKey ? SHORTCUT_ICON_MAP[matchKey] : Hammer;
};

const CATEGORY_SHORTCUT_FALLBACKS = [
  { slug: "arquitectura", name: "Arquitectura", phase: "Planificacion" },
  { slug: "ingenieria_civil", name: "Ingenieria civil", phase: "Planificacion" },
  { slug: "construccion_ejecucion", name: "Construccion y ejecucion", phase: "Construccion" },
  { slug: "supervision_gerencia", name: "Supervision y gerencia", phase: "Construccion" },
  { slug: "instalaciones_especiales", name: "Instalaciones especiales", phase: "Construccion" },
  { slug: "mantenimiento_preventivo", name: "Mantenimiento preventivo", phase: "Mantenimiento" },
  { slug: "seguridad_salud", name: "Seguridad y salud", phase: "Mantenimiento" },
  { slug: "materiales", name: "Materiales y suplidores", phase: "Directorio" },
] as const;

const resolvePhaseHref = (phaseSlug: string, phaseExists: boolean, fallbackHref: string) =>
  phaseExists ? `/fase/${phaseSlug}` : fallbackHref;

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [shouldLoadDeferredData, setShouldLoadDeferredData] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
  const { data: providers = [] } = useFeaturedProviders(4, shouldLoadDeferredData);
  const { data: featuredProjects = [] } = useFeaturedPortfolioProjects(6, shouldLoadDeferredData);
  const { data: phases = [] } = usePhases(shouldLoadDeferredData);
  const { data: taxonomyCatalog } = useTaxonomyCatalog(shouldLoadDeferredData);

  const featuredProviders = providers.slice(0, 4);
  const phaseSlugSet = new Set(phases.map((phase) => phase.slug));
  const categoryShortcuts = phases
    .flatMap((phase) =>
      phase.categories.slice(0, 3).map((category) => ({
        slug: category.slug,
        name: category.name,
        phase: phase.name,
      })),
    )
    .slice(0, 8);
  const shortcuts = categoryShortcuts.length > 0 ? categoryShortcuts : CATEGORY_SHORTCUT_FALLBACKS;
  const projectCards = featuredProjects.slice(0, 6);

  const planningHref = resolvePhaseHref("planificacion", phaseSlugSet.has("planificacion"), `${PUBLIC_ROUTES.directorio}?categoria=planificacion`);
  const constructionHref = resolvePhaseHref("construccion", phaseSlugSet.has("construccion"), `${PUBLIC_ROUTES.directorio}?categoria=construccion`);
  const maintenanceHref = resolvePhaseHref("mantenimiento", phaseSlugSet.has("mantenimiento"), `${PUBLIC_ROUTES.directorio}?categoria=mantenimiento`);

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

  const trackHomepageSearchSubmitted = (source: "hero_cta" | "intent_card", targetHref: string) => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.HomepageSearchSubmitted, {
      source,
      target_href: targetHref,
    });
  };

  const trackCategoryShortcutClick = (shortcut: { slug: string; name: string; phase: string }, targetHref: string) => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.HomepageCategoryShortcutClicked, {
      source: "homepage_shortcuts",
      category_slug: shortcut.slug,
      category_name: shortcut.name,
      phase_name: shortcut.phase,
      target_href: targetHref,
    });
  };

  const trackRegisterCompanyClick = (source: "homepage_hero" | "homepage_cta_section", targetHref: string) => {
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.RegisterCompanyCtaClicked, {
      source,
      target_href: targetHref,
    });
  };

  const handleHeroSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = heroSearchQuery.trim();
    const targetHref = trimmed
      ? `${PUBLIC_ROUTES.directorio}?q=${encodeURIComponent(trimmed)}`
      : PUBLIC_ROUTES.directorio;
    trackHomepageSearchSubmitted("hero_cta", targetHref);
    navigate(targetHref);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-cover bg-center opacity-70 md:block lg:w-[55%]"
          style={{ backgroundImage: "url('/hero-construction-bw.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-full bg-gradient-to-r from-foreground via-foreground/90 via-40% to-transparent md:block"
        />
        <div className="container relative mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="w-full">
            <div className="md:max-w-4xl lg:max-w-[56rem] xl:max-w-[64rem]">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background/65">ObrasRD - Republica Dominicana</p>
            <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
              Encuentra el profesional correcto para tu obra en Republica Dominicana.
            </h1>
            <p className="mt-3 hidden text-sm leading-relaxed text-background/80 sm:block md:mt-4 md:text-base">
              Compara empresas y tecnicos verificados por categoria, zona y experiencia. Contacta directo por WhatsApp y avanza tu proyecto con confianza.
            </p>

            <form
              role="search"
              onSubmit={handleHeroSearchSubmit}
              className="mt-4 flex w-full max-w-xl items-center gap-2 rounded-lg border border-background/25 bg-background/5 p-1.5 backdrop-blur-sm focus-within:border-background/60 sm:mt-7"
            >
              <label htmlFor="hero-search" className="sr-only">
                Buscar servicios, oficios o categorias
              </label>
              <Search aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 text-background/70" />
              <Input
                id="hero-search"
                type="search"
                value={heroSearchQuery}
                onChange={(event) => setHeroSearchQuery(event.target.value)}
                placeholder="Plomero, electricista, ingeniero estructural..."
                className="h-10 flex-1 border-0 bg-transparent px-1 text-sm text-background shadow-none placeholder:text-background/50 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button type="submit" variant="accent" size="sm" className="h-10 shrink-0 px-4">
                Buscar
              </Button>
            </form>

            <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:gap-5">
              <Button asChild variant="link" className="h-auto justify-start p-0 text-background/80 hover:text-background">
                <Link to={PUBLIC_ROUTES.directorio} onClick={() => trackHomepageSearchSubmitted("hero_cta", PUBLIC_ROUTES.directorio)}>
                  Explorar todo el directorio
                </Link>
              </Button>
              <span aria-hidden="true" className="hidden h-3 w-px bg-background/25 sm:block" />
              <Link
                to={PUBLIC_ROUTES.empresas}
                onClick={() => trackRegisterCompanyClick("homepage_hero", PUBLIC_ROUTES.empresas)}
                className="inline-flex font-semibold text-background/70 transition-colors hover:text-background"
              >
                Eres empresa? Registra tu negocio
              </Link>
            </div>

            <div className="mt-5">
              <Link
                to={PUBLIC_ROUTES.conocimiento}
                className="inline-flex text-xs font-semibold uppercase tracking-wide text-background/60 transition-colors hover:text-background"
              >
                Explorar conocimiento por etapas
              </Link>
            </div>
            </div>

            <div className="mt-6 hidden gap-2 text-[11px] sm:grid sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg border border-background/20 bg-background/5 px-4 py-3">
                <p className="font-semibold text-background">Visibilidad por categoria</p>
                <p className="text-background/75">Aparece en busquedas por etapa, disciplina y ciudad.</p>
              </div>
              <div className="rounded-lg border border-background/20 bg-background/5 px-4 py-3">
                <p className="font-semibold text-background">Leads con contexto</p>
                <p className="text-background/75">Recibe solicitudes con zona, alcance y contacto directo.</p>
              </div>
              <div className="rounded-lg border border-background/20 bg-background/5 px-4 py-3 sm:col-span-2 md:col-span-1">
                <p className="font-semibold text-background">Prueba de trabajo + confianza</p>
                <p className="text-background/75">Muestra portafolio y fortalece tu perfil con senales de calidad.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="atajos-categorias" className="px-4 py-12 md:py-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="label-upper">Directorio</p>
            <span aria-hidden="true" className="section-accent-bar" />
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">Atajos por categoria clave</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Entra directo a categorias de alta demanda y reduce tiempo de busqueda.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((shortcut) => {
              const targetHref = `${PUBLIC_ROUTES.directorio}?categoria=${shortcut.slug}`;
              const Icon = getShortcutIcon(shortcut.slug);
              return (
                <Link
                  key={`${shortcut.slug}-${shortcut.phase}`}
                  to={targetHref}
                  onClick={() => trackCategoryShortcutClick(shortcut, targetHref)}
                  className="group flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/40 hover:bg-muted/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors group-hover:border-accent group-hover:text-accent">
                    <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{shortcut.name}</p>
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-5">
            <Button asChild variant="link" className="h-auto justify-start p-0 text-foreground hover:text-accent">
              <Link to={PUBLIC_ROUTES.directorio}>
                Ver todas las categorias
                <span aria-hidden="true" className="ml-1">&rarr;</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="proveedores-destacados" className="px-4 pb-12 md:pb-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-upper">Confianza</p>
              <span aria-hidden="true" className="section-accent-bar" />
              <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">Empresas y profesionales destacados</h2>
            </div>
            <Button asChild variant="ghost" className="justify-start md:justify-center">
              <Link to={PUBLIC_ROUTES.directorio}>Ver todo en directorio</Link>
            </Button>
          </div>

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

      <section id="proyectos-reales" className="px-4 pb-12 md:pb-16">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <p className="label-upper">Obras verificadas</p>
            <span aria-hidden="true" className="section-accent-bar" />
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">Proyectos con evidencia publicados en el directorio</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Compara obras reales por etapa, categoria tecnica y responsable para tomar decisiones con mayor confianza.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projectCards.length > 0 ? (
              projectCards.map((project) => (
                <PortfolioProjectCard
                  key={project.id}
                  project={project}
                  providerName={project.provider.name}
                  providerId={project.provider.id}
                  projectHref={`/proyectos/reales/${project.id}`}
                  imageUrl={project.coverImageUrl || project.provider.portfolioImages?.[0]}
                  stageLabel={
                    project.stageId
                      ? phases.find((item) => item.id === project.stageId)?.name
                      : phases.find((item) => item.id === project.provider.phaseId)?.name
                  }
                  categoryLabel={
                    project.primaryServiceId
                      ? taxonomyCatalog?.services.find((item) => item.id === project.primaryServiceId)?.name
                      : project.disciplineId
                        ? taxonomyCatalog?.disciplines.find((item) => item.id === project.disciplineId)?.name
                        : undefined
                  }
                  workTypeLabel={
                    project.primaryWorkTypeId
                      ? taxonomyCatalog?.workTypes.find((item) => item.id === project.primaryWorkTypeId)?.name
                      : undefined
                  }
                  locationLabel={project.location || project.provider.city || project.provider.location}
                />
              ))
            ) : (
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground md:col-span-3">
                Todavia no hay proyectos visibles. Puedes revisar perfiles con portafolio en el directorio.
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="ghost" className="px-0">
              <Link to={PUBLIC_ROUTES.directorio}>Ver mas perfiles con evidencia de obra</Link>
            </Button>
            {projectCards.length > 0 && (
              <Button asChild variant="outline">
                <Link to={`/proyectos/reales/${projectCards[0].id}`}>Explorar detalle de proyecto</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <StageExplainerSection
        planningHref={planningHref}
        constructionHref={constructionHref}
        maintenanceHref={maintenanceHref}
      />

      <section id="cta-empresas" className="px-4 pb-12 md:pb-16">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="label-upper">Empresas</p>
            <span aria-hidden="true" className="section-accent-bar" />
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Tienes empresa, cuadrilla o servicio tecnico? Entra al flujo de captacion de ObrasRD.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Registra tu perfil para ganar presencia en categorias de alta demanda, demostrar ejecucion con proyectos reales y captar leads en Republica Dominicana.
            </p>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">Aparece en busquedas de tu ciudad y especialidad.</div>
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">Recibe solicitudes de clientes con intencion real de contratar.</div>
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">Publica proyectos terminados para demostrar tu experiencia.</div>
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">Contacta directo por WhatsApp sin intermediarios ni comisiones.</div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="accent">
                <Link
                  to={PUBLIC_ROUTES.empresas}
                  onClick={() => trackRegisterCompanyClick("homepage_cta_section", PUBLIC_ROUTES.empresas)}
                >
                  Registrar empresa
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/precios">Ver planes para empresas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-black tracking-tight text-foreground">ObrasRD</p>
              <p className="mt-1 text-xs text-muted-foreground">Marketplace de construccion para Republica Dominicana.</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Directorio</p>
              <div className="space-y-1 text-sm">
                <Link to={PUBLIC_ROUTES.directorio} className="block text-muted-foreground transition-colors hover:text-foreground">Directorio de servicios</Link>
                <Link to={`${PUBLIC_ROUTES.directorio}?tab=servicios`} className="block text-muted-foreground transition-colors hover:text-foreground">Profesionales</Link>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Materiales</p>
              <div className="space-y-1 text-sm">
                <Link to={PUBLIC_ROUTES.materiales} className="block text-muted-foreground transition-colors hover:text-foreground">Materiales y suplidores</Link>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Guias</p>
              <div className="space-y-1 text-sm">
                <Link to={PUBLIC_ROUTES.conocimiento} className="block text-muted-foreground transition-colors hover:text-foreground">Guias por escenario</Link>
                <Link to={planningHref} className="block text-muted-foreground transition-colors hover:text-foreground">Planificacion</Link>
                <Link to={constructionHref} className="block text-muted-foreground transition-colors hover:text-foreground">Construccion</Link>
                <Link to={maintenanceHref} className="block text-muted-foreground transition-colors hover:text-foreground">Mantenimiento</Link>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Empresas</p>
              <div className="space-y-1 text-sm">
                <Link to={PUBLIC_ROUTES.empresas} className="block text-muted-foreground transition-colors hover:text-foreground">Registrar empresa</Link>
                <Link to="/precios" className="block text-muted-foreground transition-colors hover:text-foreground">Planes</Link>
                <Link to="/proyectos" className="block text-muted-foreground transition-colors hover:text-foreground">Publicar proyecto</Link>
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
