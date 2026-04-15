import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MaterialCard from "@/components/MaterialCard";
import ProviderCard from "@/components/ProviderCard";
import MarketplaceFilters from "@/components/search/MarketplaceFilters";
import { Button } from "@/components/ui/button";
import { useProviders, useMaterials, usePhases } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import {
  CANONICAL_DISCIPLINES,
  CANONICAL_SERVICES,
  CANONICAL_STAGES,
  type CanonicalDisciplineSlug,
  type CanonicalServiceSlug,
  type CanonicalStageSlug,
} from "@/lib/taxonomy";
import {
  getLegacyCategoryTaxonomyMapping,
  getLegacyTaxonomySearchTerms,
} from "@/lib/legacy-taxonomy-compat";
import {
  clearStructuredFilters,
  countActiveStructuredFilters,
  parseSearchFilterState,
  patchSearchFilterState,
  toSearchParams,
  type SearchFilterState,
  type SearchTab,
} from "@/lib/search/search-filter-state";

const canonicalDisciplineStageBySlug = new Map(
  CANONICAL_DISCIPLINES.map((item) => [item.slug, item.stageSlug]),
);

const canonicalServiceMetaBySlug = new Map(
  CANONICAL_SERVICES.map((item) => [item.slug, { stageSlug: item.stageSlug, disciplineSlug: item.disciplineSlug }]),
);

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchState = useMemo(() => parseSearchFilterState(searchParams), [searchParams]);

  const [queryDraft, setQueryDraft] = useState(searchState.q);

  const {
    data: providers = [],
    isLoading: isProvidersLoading,
    isError: hasProvidersError,
  } = useProviders();
  const {
    data: materials = [],
    isLoading: isMaterialsLoading,
    isError: hasMaterialsError,
  } = useMaterials();
  const { data: phases = [] } = usePhases();
  const {
    data: taxonomyCatalog,
    isLoading: isTaxonomyLoading,
    isError: hasTaxonomyError,
  } = useTaxonomyCatalog();

  useEffect(() => {
    setQueryDraft(searchState.q);
  }, [searchState.q]);

  const allDisciplines = taxonomyCatalog?.disciplines ?? [];
  const allServices = taxonomyCatalog?.services ?? [];
  const allWorkTypes = taxonomyCatalog?.workTypes ?? [];

  const disciplineById = useMemo(
    () => new Map(allDisciplines.map((item) => [item.id, item])),
    [allDisciplines],
  );
  const serviceById = useMemo(() => new Map(allServices.map((item) => [item.id, item])), [allServices]);
  const workTypeById = useMemo(() => new Map(allWorkTypes.map((item) => [item.id, item])), [allWorkTypes]);
  const phaseById = useMemo(() => new Map(phases.map((item) => [item.id, item])), [phases]);

  const stageIdsBySlug = useMemo(() => {
    const map = new Map<string, Set<number>>();

    for (const stage of CANONICAL_STAGES) {
      map.set(stage.slug, new Set<number>());
    }

    for (const discipline of allDisciplines) {
      const stageSlug = canonicalDisciplineStageBySlug.get(discipline.slug as CanonicalDisciplineSlug);
      if (!stageSlug) continue;
      map.get(stageSlug)?.add(discipline.stageId);
    }

    for (const service of allServices) {
      const meta = canonicalServiceMetaBySlug.get(service.slug as CanonicalServiceSlug);
      if (!meta) continue;
      map.get(meta.stageSlug)?.add(service.stageId);
    }

    return map;
  }, [allDisciplines, allServices]);

  const stageOptions = useMemo(
    () => CANONICAL_STAGES.map((stage) => ({ value: stage.slug, label: stage.label })),
    [],
  );

  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    const items: { value: string; label: string }[] = [];

    for (const phase of phases) {
      for (const category of phase.categories) {
        if (seen.has(category.slug)) continue;
        seen.add(category.slug);
        items.push({ value: category.slug, label: category.name });
      }
    }

    return items.sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [phases]);

  const disciplineOptions = useMemo(() => {
    if (!searchState.etapa) {
      return allDisciplines.map((item) => ({ value: item.slug, label: item.name }));
    }

    const stageIds = stageIdsBySlug.get(searchState.etapa) ?? new Set<number>();

    const filtered = allDisciplines.filter((item) => {
      const stageBySlug = canonicalDisciplineStageBySlug.get(item.slug as CanonicalDisciplineSlug);
      if (stageBySlug) return stageBySlug === (searchState.etapa as CanonicalStageSlug);
      return stageIds.size > 0 ? stageIds.has(item.stageId) : true;
    });

    return filtered.map((item) => ({ value: item.slug, label: item.name }));
  }, [allDisciplines, searchState.etapa, stageIdsBySlug]);

  const serviceOptions = useMemo(() => {
    const stageIds = searchState.etapa ? stageIdsBySlug.get(searchState.etapa) ?? new Set<number>() : new Set<number>();

    const disciplineIds = searchState.disciplina
      ? new Set(
          allDisciplines
            .filter((item) => item.slug === searchState.disciplina)
            .map((item) => item.id),
        )
      : new Set<number>();

    const filtered = allServices.filter((item) => {
      if (searchState.disciplina) {
        if (disciplineIds.size > 0 && !disciplineIds.has(item.disciplineId)) return false;

        const serviceMeta = canonicalServiceMetaBySlug.get(item.slug as CanonicalServiceSlug);
        if (serviceMeta) {
          return serviceMeta.disciplineSlug === (searchState.disciplina as CanonicalDisciplineSlug);
        }

        return true;
      }

      if (searchState.etapa) {
        const serviceMeta = canonicalServiceMetaBySlug.get(item.slug as CanonicalServiceSlug);
        if (serviceMeta) {
          return serviceMeta.stageSlug === (searchState.etapa as CanonicalStageSlug);
        }

        return stageIds.size > 0 ? stageIds.has(item.stageId) : true;
      }

      return true;
    });

    return filtered.map((item) => ({ value: item.slug, label: item.name }));
  }, [allDisciplines, allServices, searchState.disciplina, searchState.etapa, stageIdsBySlug]);

  const workTypeOptions = useMemo(
    () => allWorkTypes.map((item) => ({ value: item.code, label: item.name })),
    [allWorkTypes],
  );

  const applyState = (nextState: SearchFilterState, replace = true) => {
    setSearchParams(toSearchParams(nextState), { replace });
  };

  const applyPatch = (patch: Partial<SearchFilterState>, replace = true) => {
    applyState(patchSearchFilterState(searchState, patch), replace);
  };

  const handleTabChange = (tab: SearchTab) => {
    if (tab === "materiales") {
      applyPatch({ tab, categoria: searchState.categoria || "materiales" }, false);
      return;
    }

    applyPatch(
      {
        tab,
        categoria: searchState.categoria === "materiales" ? "" : searchState.categoria,
      },
      false,
    );
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyPatch({ q: queryDraft.trim() }, false);
  };

  useEffect(() => {
    const validDisciplineSlugs = new Set(disciplineOptions.map((item) => item.value));
    const validServiceSlugs = new Set(serviceOptions.map((item) => item.value));
    const validWorkTypeSlugs = new Set(workTypeOptions.map((item) => item.value));

    let next = searchState;
    let changed = false;

    if (searchState.disciplina && !validDisciplineSlugs.has(searchState.disciplina)) {
      next = patchSearchFilterState(next, { disciplina: "", servicio: "" });
      changed = true;
    }

    if (next.servicio && !validServiceSlugs.has(next.servicio)) {
      next = patchSearchFilterState(next, { servicio: "" });
      changed = true;
    }

    if (next.tipoObra && !validWorkTypeSlugs.has(next.tipoObra)) {
      next = patchSearchFilterState(next, { tipoObra: "" });
      changed = true;
    }

    if (changed) {
      applyState(next, true);
    }
  }, [disciplineOptions, serviceOptions, workTypeOptions, searchState]);

  const normalizedQuery = searchState.q.toLowerCase();

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const mapping = getLegacyCategoryTaxonomyMapping(provider.categorySlug);
      const taxonomyTerms = getLegacyTaxonomySearchTerms(provider.categorySlug);

      const providerPhase = phaseById.get(provider.phaseId);
      const primaryDiscipline = provider.primaryDisciplineId
        ? disciplineById.get(provider.primaryDisciplineId)
        : undefined;
      const primaryService = provider.primaryServiceId
        ? serviceById.get(provider.primaryServiceId)
        : undefined;

      const providerServices = (provider.serviceIds ?? [])
        .map((id) => serviceById.get(id))
        .filter(Boolean);

      const providerWorkTypes = (provider.workTypeIds ?? [])
        .map((id) => workTypeById.get(id))
        .filter(Boolean);

      const serviceSlugs = new Set<string>();
      const disciplineSlugs = new Set<string>();
      const stageSlugs = new Set<string>();
      const workTypeSlugs = new Set<string>();

      if (providerPhase?.slug) {
        stageSlugs.add(providerPhase.slug);
      }

      if (mapping?.stageSlug) stageSlugs.add(mapping.stageSlug);
      if (mapping?.disciplineSlug) disciplineSlugs.add(mapping.disciplineSlug);
      if (mapping?.serviceSlug) serviceSlugs.add(mapping.serviceSlug);
      if (mapping?.workTypeSlug) workTypeSlugs.add(mapping.workTypeSlug);

      if (primaryDiscipline) {
        disciplineSlugs.add(primaryDiscipline.slug);
        const stageSlug = canonicalDisciplineStageBySlug.get(primaryDiscipline.slug as CanonicalDisciplineSlug);
        if (stageSlug) stageSlugs.add(stageSlug);
      }

      if (primaryService) {
        serviceSlugs.add(primaryService.slug);
        const serviceMeta = canonicalServiceMetaBySlug.get(primaryService.slug as CanonicalServiceSlug);
        if (serviceMeta) {
          stageSlugs.add(serviceMeta.stageSlug);
          disciplineSlugs.add(serviceMeta.disciplineSlug);
        }
      }

      for (const service of providerServices) {
        if (!service) continue;
        serviceSlugs.add(service.slug);
        const serviceMeta = canonicalServiceMetaBySlug.get(service.slug as CanonicalServiceSlug);
        if (serviceMeta) {
          stageSlugs.add(serviceMeta.stageSlug);
          disciplineSlugs.add(serviceMeta.disciplineSlug);
        }
      }

      for (const workType of providerWorkTypes) {
        if (!workType) continue;
        workTypeSlugs.add(workType.code);
      }

      const matchesQuery =
        !normalizedQuery ||
        provider.name.toLowerCase().includes(normalizedQuery) ||
        provider.trade.toLowerCase().includes(normalizedQuery) ||
        provider.categorySlug.toLowerCase().includes(normalizedQuery) ||
        provider.location.toLowerCase().includes(normalizedQuery) ||
        provider.city.toLowerCase().includes(normalizedQuery) ||
        taxonomyTerms.some((term) => term.includes(normalizedQuery));

      const matchesLegacyCategory =
        !searchState.categoria ||
        provider.categorySlug === searchState.categoria ||
        stageSlugs.has(searchState.categoria) ||
        disciplineSlugs.has(searchState.categoria) ||
        serviceSlugs.has(searchState.categoria) ||
        workTypeSlugs.has(searchState.categoria) ||
        mapping?.serviceSlug === searchState.categoria ||
        mapping?.disciplineSlug === searchState.categoria ||
        mapping?.stageSlug === searchState.categoria ||
        mapping?.workTypeSlug === searchState.categoria;

      const matchesStage = !searchState.etapa || stageSlugs.has(searchState.etapa);
      const matchesDiscipline = !searchState.disciplina || disciplineSlugs.has(searchState.disciplina);
      const matchesService = !searchState.servicio || serviceSlugs.has(searchState.servicio);
      const matchesWorkType = !searchState.tipoObra || workTypeSlugs.has(searchState.tipoObra);

      return (
        matchesQuery &&
        matchesLegacyCategory &&
        matchesStage &&
        matchesDiscipline &&
        matchesService &&
        matchesWorkType
      );
    });
  }, [
    providers,
    phaseById,
    disciplineById,
    serviceById,
    workTypeById,
    normalizedQuery,
    searchState.categoria,
    searchState.etapa,
    searchState.disciplina,
    searchState.servicio,
    searchState.tipoObra,
  ]);

  const filteredMaterials = useMemo(
    () =>
      materials.filter(
        (material) =>
          material.name.toLowerCase().includes(normalizedQuery) ||
          material.category.toLowerCase().includes(normalizedQuery) ||
          material.supplier.toLowerCase().includes(normalizedQuery),
      ),
    [materials, normalizedQuery],
  );

  const activeFilterCount = countActiveStructuredFilters(searchState);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container mx-auto max-w-5xl">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Inicio
          </Button>

          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar servicio, etapa, disciplina o material..."
              value={queryDraft}
              onChange={(event) => setQueryDraft(event.target.value)}
              className="w-full rounded-lg bg-card py-3 pl-10 pr-4 text-foreground obra-shadow outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
            />
          </form>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => handleTabChange("servicios")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                searchState.tab === "servicios"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Servicios ({filteredProviders.length})
            </button>
            <button
              onClick={() => handleTabChange("materiales")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                searchState.tab === "materiales"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Materiales ({filteredMaterials.length})
            </button>
          </div>

          {searchState.tab === "servicios" && (
            <MarketplaceFilters
              state={searchState}
              categoryOptions={categoryOptions}
              stageOptions={stageOptions}
              disciplineOptions={disciplineOptions}
              serviceOptions={serviceOptions}
              workTypeOptions={workTypeOptions}
              activeFilterCount={activeFilterCount}
              isTaxonomyLoading={isTaxonomyLoading}
              hasTaxonomyError={hasTaxonomyError}
              onCategoryChange={(value) => applyPatch({ categoria: value }, false)}
              onStageChange={(value) => applyPatch({ etapa: value, disciplina: "", servicio: "" }, false)}
              onDisciplineChange={(value) => applyPatch({ disciplina: value, servicio: "" }, false)}
              onServiceChange={(value) => applyPatch({ servicio: value }, false)}
              onWorkTypeChange={(value) => applyPatch({ tipoObra: value }, false)}
              onClearFilters={() => applyState(clearStructuredFilters(searchState), false)}
            />
          )}

          <div className="mt-6">
            {searchState.tab === "servicios" ? (
              hasProvidersError ? (
                <div className="rounded-xl bg-card p-8 text-center obra-shadow">
                  <p className="text-sm text-foreground">No se pudieron cargar los servicios.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Intenta nuevamente en unos minutos.</p>
                </div>
              ) : isProvidersLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-48 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              ) : filteredProviders.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filteredProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-card p-8 text-center obra-shadow">
                  <p className="text-sm text-muted-foreground">
                    No encontramos proveedores con esos filtros. Ajusta etapa, disciplina o servicio.
                  </p>
                </div>
              )
            ) : hasMaterialsError ? (
              <div className="rounded-xl bg-card p-8 text-center obra-shadow">
                <p className="text-sm text-foreground">No se pudieron cargar los materiales.</p>
                <p className="mt-1 text-xs text-muted-foreground">Intenta nuevamente en unos minutos.</p>
              </div>
            ) : isMaterialsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-36 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredMaterials.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredMaterials.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-card p-8 text-center obra-shadow">
                <p className="text-sm text-muted-foreground">No se encontraron materiales.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
