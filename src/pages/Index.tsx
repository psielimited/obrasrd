import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import StageExplainerSection from "@/components/home/StageExplainerSection";
import ProviderCard from "@/components/ProviderCard";
import MarketplaceVisualFrame from "@/components/marketplace/MarketplaceVisualFrame";
import { Button } from "@/components/ui/button";
import { useFeaturedProviders, usePhases } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

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
  const [shouldLoadDeferredData, setShouldLoadDeferredData] = useState(false);
  const { data: providers = [] } = useFeaturedProviders(4, shouldLoadDeferredData);
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
  const projectProofProviders = featuredProviders
    .filter((provider) => provider.portfolioImages?.[0])
    .slice(0, 3);

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

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <section className="border-b border-border bg-foreground px-4 py-12 text-background md:py-16">
        <div className="container relative mx-auto max-w-5xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background/65">ObrasRD - Republica Dominicana</p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            Busca servicios, conecta con profesionales y avanza tu obra con criterio.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/80 md:text-base">
            Marketplace dominicano para construccion: descubre opciones confiables, registra tu empresa y consulta guias del sector en un mismo lugar.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="accent" size="lg" className="sm:w-auto">
              <Link to={PUBLIC_ROUTES.directorio}>Buscar servicios</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background sm:w-auto">
              <Link to={PUBLIC_ROUTES.empresas}>Registrar empresa</Link>
            </Button>
          </div>

          <div className="mt-5">
            <Link
              to={PUBLIC_ROUTES.conocimiento}
              className="inline-flex text-sm font-semibold text-background/80 transition-colors hover:text-background"
            >
              Ver guias y conocimiento del sector
            </Link>
          </div>
        </div>
      </section>

      <section id="atajos-categorias" className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Directorio</p>
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Atajos por categoria clave</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Entra directo a categorias de alta demanda y reduce tiempo de busqueda.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((shortcut) => (
              <Link
                key={`${shortcut.slug}-${shortcut.phase}`}
                to={`${PUBLIC_ROUTES.directorio}?categoria=${shortcut.slug}`}
                className="rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-foreground/25"
              >
                <p className="text-sm font-semibold text-foreground">{shortcut.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{shortcut.phase}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="proveedores-destacados" className="px-4 pb-10 md:pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Confianza</p>
              <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Empresas y profesionales destacados</h2>
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

      <section id="proyectos-reales" className="px-4 pb-10 md:pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Prueba de trabajo</p>
            <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Proyectos reales publicados en el directorio</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {projectProofProviders.length > 0 ? (
              projectProofProviders.map((provider) => (
                <Link key={provider.id} to={`/proveedor/${provider.id}`} className="block">
                  <MarketplaceVisualFrame categorySlug={provider.categorySlug} categoryLabel={provider.trade}>
                    <img
                      src={provider.portfolioImages[0]}
                      alt={`Proyecto de ${provider.name}`}
                      className="h-48 w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </MarketplaceVisualFrame>
                  <div className="mt-2 px-1">
                    <p className="text-sm font-semibold text-foreground">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {provider.completedProjects} proyectos completados · {provider.city || provider.location}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground md:col-span-3">
                Estamos actualizando evidencia de proyectos. Puedes ver mas perfiles directamente en el directorio.
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button asChild variant="ghost" className="px-0">
              <Link to={PUBLIC_ROUTES.directorio}>Ver mas perfiles con evidencia de obra</Link>
            </Button>
          </div>
        </div>
      </section>

      <StageExplainerSection
        planningHref={planningHref}
        constructionHref={constructionHref}
        maintenanceHref={maintenanceHref}
      />

      <section id="cta-empresas" className="px-4 pb-10 md:pb-12">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Empresas</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground md:text-3xl">
              Tienes una empresa o servicio? Publica tu perfil y consigue mas contactos.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Muestra experiencia, portafolio y zonas de servicio para recibir oportunidades desde ObrasRD.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="accent">
                <Link to={PUBLIC_ROUTES.empresas}>Registrar empresa</Link>
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
                <Link to="/materiales" className="block text-muted-foreground transition-colors hover:text-foreground">Materiales / Suplidores</Link>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Conocimiento</p>
              <div className="space-y-1 text-sm">
                <Link to={PUBLIC_ROUTES.conocimiento} className="block text-muted-foreground transition-colors hover:text-foreground">Guias por escenario</Link>
                <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Arquitectura por etapas</p>
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
