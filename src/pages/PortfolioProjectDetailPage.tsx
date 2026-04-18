import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import PortfolioGallery from "@/components/marketplace/PortfolioGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePortfolioProject, usePhases, useProviderSummaries } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { buildDirectoryTopicHref } from "@/lib/content-directory-links";

const STATUS_LABELS: Record<string, string> = {
  planned: "Planificado",
  in_progress: "En ejecucion",
  completed: "Completado",
  on_hold: "En pausa",
  cancelled: "Cancelado",
};

const formatDate = (value?: string) => {
  if (!value) return "No especificada";
  return new Date(value).toLocaleDateString("es-DO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const upsertMeta = (selector: string, factory: () => HTMLElement, updater: (el: HTMLElement) => void) => {
  let target = document.head.querySelector(selector) as HTMLElement | null;
  if (!target) {
    target = factory();
    document.head.appendChild(target);
  }
  updater(target);
};

const PortfolioProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = usePortfolioProject(projectId);
  const { data: providers = [] } = useProviderSummaries();
  const { data: phases = [] } = usePhases();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();

  const stageLabel = useMemo(() => {
    if (!project) return undefined;
    const stageFromProject = project.stageId ? phases.find((item) => item.id === project.stageId)?.name : undefined;
    const stageFromProvider = phases.find((item) => item.id === project.provider.phaseId)?.name;
    return stageFromProject || stageFromProvider;
  }, [project, phases]);

  const categoryLabels = useMemo(() => {
    if (!project || !taxonomyCatalog) return [] as string[];

    const labels = new Set<string>();

    if (project.disciplineId) {
      const discipline = taxonomyCatalog.disciplines.find((item) => item.id === project.disciplineId);
      if (discipline?.name) labels.add(discipline.name);
    }

    if (project.primaryServiceId) {
      const service = taxonomyCatalog.services.find((item) => item.id === project.primaryServiceId);
      if (service?.name) labels.add(service.name);
    }

    if (project.primaryWorkTypeId) {
      const workType = taxonomyCatalog.workTypes.find((item) => item.id === project.primaryWorkTypeId);
      if (workType?.name) labels.add(`Tipo: ${workType.name}`);
    }

    return Array.from(labels);
  }, [project, taxonomyCatalog]);

  const galleryImages = useMemo(() => {
    if (!project) return [] as string[];
    const pool = [project.coverImageUrl, ...(project.provider.portfolioImages ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(pool));
  }, [project]);

  const taxonomyTargets = useMemo(() => {
    if (!project || !taxonomyCatalog) {
      return {
        stageSlug: undefined,
        disciplineSlug: undefined,
        serviceSlug: undefined,
        workTypeCode: undefined,
      };
    }

    const stageDiscipline = project.disciplineId
      ? taxonomyCatalog.disciplines.find((item) => item.id === project.disciplineId)
      : undefined;
    return {
      stageSlug: undefined,
      disciplineSlug: stageDiscipline?.slug,
      serviceSlug: project.primaryServiceId
        ? taxonomyCatalog.services.find((item) => item.id === project.primaryServiceId)?.slug
        : undefined,
      workTypeCode: project.primaryWorkTypeId
        ? taxonomyCatalog.workTypes.find((item) => item.id === project.primaryWorkTypeId)?.code
        : undefined,
    };
  }, [project, taxonomyCatalog]);

  const relatedProviders = useMemo(() => {
    if (!project) return [];

    return providers
      .filter((provider) => provider.id !== project.provider.id)
      .map((provider) => {
        let score = 0;

        if (project.disciplineId && provider.primaryDisciplineId === project.disciplineId) score += 2;
        if (project.primaryServiceId && provider.primaryServiceId === project.primaryServiceId) score += 4;
        if (project.primaryWorkTypeId && (provider.workTypeIds ?? []).includes(project.primaryWorkTypeId)) score += 2;

        const providerLocation = `${provider.city} ${provider.location}`.toLowerCase();
        if (project.location && providerLocation.includes(project.location.toLowerCase())) score += 1;

        return { provider, score };
      })
      .filter((item) => item.score > 0)
      .sort((current, next) => {
        if (next.score !== current.score) return next.score - current.score;
        if (next.provider.verified !== current.provider.verified) return Number(next.provider.verified) - Number(current.provider.verified);
        return next.provider.rating - current.provider.rating;
      })
      .slice(0, 4)
      .map((item) => item.provider);
  }, [project, providers]);

  const directoryLinks = useMemo(() => {
    if (!project) return [] as { label: string; href: string; ctaType: "ver_empresas_relacionadas" | "buscar_este_servicio" | "ver_categoria_relacionada" }[];

    const locationQuery = project.location || project.provider.city || project.provider.location;

    const links = [
      {
        label: "Ver empresas relacionadas",
        href: buildDirectoryTopicHref({
          etapa: taxonomyTargets.stageSlug,
          disciplina: taxonomyTargets.disciplineSlug,
          servicio: taxonomyTargets.serviceSlug,
          tipoObra: taxonomyTargets.workTypeCode,
          ubicacion: locationQuery,
        }),
        ctaType: "ver_empresas_relacionadas" as const,
      },
      {
        label: "Buscar este servicio",
        href: buildDirectoryTopicHref({
          servicio: taxonomyTargets.serviceSlug,
          etapa: taxonomyTargets.stageSlug,
          ubicacion: locationQuery,
        }),
        ctaType: "buscar_este_servicio" as const,
      },
      {
        label: "Ver categoria relacionada",
        href: buildDirectoryTopicHref({
          etapa: taxonomyTargets.stageSlug,
          disciplina: taxonomyTargets.disciplineSlug,
        }),
        ctaType: "ver_categoria_relacionada" as const,
      },
    ];

    return Array.from(new Map(links.map((item) => [item.href, item])).values());
  }, [project, taxonomyTargets.disciplineSlug, taxonomyTargets.serviceSlug, taxonomyTargets.stageSlug, taxonomyTargets.workTypeCode]);

  const onContentDirectoryClick = (payload: { ctaType: "ver_empresas_relacionadas" | "buscar_este_servicio" | "ver_categoria_relacionada" | "ver_proveedor_relacionado"; href: string }) => {
    if (!project) return;

    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ContentToDirectoryClick, {
      source: "project_detail",
      project_id: project.id,
      cta_type: payload.ctaType,
      target_href: payload.href,
      stage_id: project.stageId,
      discipline_id: project.disciplineId,
      service_id: project.primaryServiceId,
      work_type_id: project.primaryWorkTypeId,
    });
  };

  useEffect(() => {
    if (!project) return;

    const locationLabel = project.location || project.provider.city || project.provider.location || "Republica Dominicana";
    const description =
      project.summary?.trim() ||
      `${project.provider.name} presenta un proyecto real en ${locationLabel}. Conoce etapa, categoria tecnica y evidencia visual en ObrasRD.`;

    document.title = `${project.title} | Proyecto real en ObrasRD`;

    upsertMeta(
      'meta[name="description"]',
      () => {
        const meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        return meta;
      },
      (meta) => meta.setAttribute("content", description),
    );

    upsertMeta(
      'meta[property="og:title"]',
      () => {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:title");
        return meta;
      },
      (meta) => meta.setAttribute("content", `${project.title} | Proyecto real en ObrasRD`),
    );

    upsertMeta(
      'meta[property="og:description"]',
      () => {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:description");
        return meta;
      },
      (meta) => meta.setAttribute("content", description),
    );

    const canonicalUrl = `${window.location.origin}/proyectos/reales/${project.id}`;

    upsertMeta(
      'meta[property="og:url"]',
      () => {
        const meta = document.createElement("meta");
        meta.setAttribute("property", "og:url");
        return meta;
      },
      (meta) => meta.setAttribute("content", canonicalUrl),
    );

    upsertMeta(
      'link[rel="canonical"]',
      () => {
        const link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        return link;
      },
      (link) => link.setAttribute("href", canonicalUrl),
    );

    const scriptId = "obrasrd-project-jsonld";
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          name: project.title,
          description,
          image: galleryImages,
          dateCreated: project.startedOn,
          datePublished: project.completedOn,
          locationCreated: {
            "@type": "Place",
            name: locationLabel,
          },
          provider: {
            "@type": "HomeAndConstructionBusiness",
            name: project.provider.name,
            url: `${window.location.origin}/proveedor/${project.provider.id}`,
          },
          url: canonicalUrl,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Inicio",
              item: window.location.origin,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Proyectos reales",
              item: `${window.location.origin}/#proyectos-reales`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: project.title,
              item: canonicalUrl,
            },
          ],
        },
      ],
    };

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const currentScript = document.getElementById(scriptId);
      if (currentScript) currentScript.remove();
    };
  }, [galleryImages, project]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <p className="text-base font-semibold text-foreground">Proyecto no encontrado</p>
          <p className="mt-1 text-sm text-muted-foreground">Puede que el registro ya no este disponible.</p>
          <Button className="mt-4" onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const locationLabel = project.location || project.provider.city || project.provider.location || "Ubicacion no indicada";
  const statusLabel = STATUS_LABELS[project.status] ?? project.status;

  return (
    <div className="min-h-screen bg-[#F0EDE7] pb-20 text-[#1A1612] md:pb-8">
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-5">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>

        <article className="rounded-2xl border border-[#E3DDD4] bg-white p-5 shadow-[0_1px_2px_rgba(26,22,18,0.05)] md:p-6">
          <header className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A6E64]">Proyecto real verificado por perfil publico</p>
            <h1 className="text-2xl font-black leading-tight tracking-tight md:text-3xl">{project.title}</h1>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-[#D2C7B9] bg-[#F5F0E8] text-[#3D342B]">
                Estado: {statusLabel}
              </Badge>
              {stageLabel && (
                <Badge variant="outline" className="border-[#D2C7B9] bg-[#F5F0E8] text-[#3D342B]">
                  Etapa: {stageLabel}
                </Badge>
              )}
              {project.provider.verified && (
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-50 text-emerald-700">
                  Proveedor verificado
                </Badge>
              )}
            </div>

            <div className="grid gap-2 text-sm text-[#5C5046] sm:grid-cols-2">
              <p className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{locationLabel}</p>
              <p className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Inicio: {formatDate(project.startedOn)}</p>
              <p className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Cierre: {formatDate(project.completedOn)}</p>
              <p className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" />Responsable: {project.provider.name}</p>
            </div>
          </header>

          <section className="mt-5">
            <PortfolioGallery
              images={galleryImages.slice(0, 8)}
              categorySlug={project.provider.categorySlug}
              categoryName={project.provider.trade}
              emptyTitle="Fotos de proyecto pendientes"
              emptyDescription="Este proyecto todavia no tiene evidencia visual publicada."
            />
          </section>

          <section className="mt-5 space-y-3 rounded-xl border border-[#E3DDD4] bg-[#F8F4EE] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A6E64]">Descripcion del proyecto</p>
            <p className="text-sm leading-relaxed text-[#3D342B]">
              {project.summary?.trim() || "El proveedor aun no ha publicado una descripcion extendida para este proyecto."}
            </p>
          </section>

          {categoryLabels.length > 0 && (
            <section className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-[#3D342B]">Categoria tecnica</p>
              <div className="flex flex-wrap gap-2">
                {categoryLabels.map((label) => (
                  <Badge key={label} variant="outline" className="border-[#D2C7B9] bg-white text-[#3D342B]">
                    {label}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {directoryLinks.length > 0 && (
            <section className="mt-5 rounded-xl border border-[#E3DDD4] bg-[#F8F4EE] p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A6E64]">Acciones recomendadas</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {directoryLinks.map((link) => (
                  <Button key={link.href} asChild size="sm" variant="outline" className="justify-between">
                    <Link
                      to={link.href}
                      onClick={() =>
                        onContentDirectoryClick({
                          ctaType: link.ctaType,
                          href: link.href,
                        })
                      }
                    >
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </section>
          )}

          <section className="mt-5 grid gap-3 rounded-xl border border-[#E3DDD4] bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A6E64]">Responsable</p>
              <p className="mt-1 text-base font-semibold text-[#1A1612]">{project.provider.name}</p>
              <p className="text-sm text-[#5C5046]">{project.provider.trade}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link
                  to={`/proveedor/${project.provider.id}`}
                  onClick={() =>
                    onContentDirectoryClick({
                      ctaType: "ver_proveedor_relacionado",
                      href: `/proveedor/${project.provider.id}`,
                    })
                  }
                >
                  Ver perfil del proveedor
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link
                  to={`/proveedor/${project.provider.id}`}
                  onClick={() =>
                    onContentDirectoryClick({
                      ctaType: "ver_proveedor_relacionado",
                      href: `/proveedor/${project.provider.id}`,
                    })
                  }
                >
                  Solicitar cotizacion
                </Link>
              </Button>
            </div>
          </section>

          {relatedProviders.length > 0 && (
            <section className="mt-5 rounded-xl border border-[#E3DDD4] bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7A6E64]">Empresas relacionadas</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {relatedProviders.map((provider) => (
                  <div key={provider.id} className="rounded-lg border border-[#E3DDD4] bg-[#F8F4EE] p-3">
                    <p className="text-sm font-semibold text-[#1A1612]">{provider.name}</p>
                    <p className="mt-0.5 text-xs text-[#5C5046]">{provider.trade}</p>
                    <p className="mt-1 text-xs text-[#7A6E64]">{provider.city || provider.location || "Republica Dominicana"}</p>
                    <Button asChild variant="ghost" size="sm" className="mt-2 h-7 px-0 text-xs">
                      <Link
                        to={`/proveedor/${provider.id}`}
                        onClick={() =>
                          onContentDirectoryClick({
                            ctaType: "ver_proveedor_relacionado",
                            href: `/proveedor/${provider.id}`,
                          })
                        }
                      >
                        Ver empresa relacionada
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};

export default PortfolioProjectDetailPage;
