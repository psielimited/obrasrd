export type SearchTab = "servicios" | "materiales";
export type SearchProviderType = "empresa" | "profesional";
export type SearchSortOption = "relevancia" | "mejor_valorados" | "mas_verificados" | "mas_recientes";

export interface SearchFilterState {
  q: string;
  categoria: string;
  ubicacion: string;
  tipoProveedor: SearchProviderType | "";
  etapa: string;
  disciplina: string;
  servicio: string;
  tipoObra: string;
  soloVerificados: boolean;
  soloIdentidadVerificada: boolean;
  soloPortafolioValidado: boolean;
  sort: SearchSortOption;
  tab: SearchTab;
}

export const SEARCH_FILTER_QUERY_KEYS = {
  q: "q",
  categoria: "categoria",
  ubicacion: "ubicacion",
  tipoProveedor: "tipo_proveedor",
  etapa: "etapa",
  disciplina: "disciplina",
  servicio: "servicio",
  tipoObra: "tipo_obra",
  soloVerificados: "solo_verificados",
  soloIdentidadVerificada: "solo_identidad_verificada",
  soloPortafolioValidado: "solo_portafolio_validado",
  sort: "sort",
  tab: "tab",
} as const;

const normalizeTab = (value: string | null): SearchTab => {
  if (value === "materiales") return "materiales";
  return "servicios";
};

const normalizeValue = (value: string | null) => (value ?? "").trim();
const normalizeBoolean = (value: string | null) => value === "1";
const normalizeSort = (value: string | null): SearchSortOption => {
  if (value === "mejor_valorados") return "mejor_valorados";
  if (value === "mas_verificados") return "mas_verificados";
  if (value === "mas_recientes") return "mas_recientes";
  return "relevancia";
};
const normalizeProviderType = (value: string | null): SearchProviderType | "" => {
  if (value === "empresa") return "empresa";
  if (value === "profesional") return "profesional";
  return "";
};

export const parseSearchFilterState = (params: URLSearchParams): SearchFilterState => {
  const categoria = normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.categoria));
  const tabFromCategoria = categoria === "materiales" ? "materiales" : undefined;

  return {
    q: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.q)),
    categoria,
    ubicacion: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.ubicacion)),
    tipoProveedor: normalizeProviderType(params.get(SEARCH_FILTER_QUERY_KEYS.tipoProveedor)),
    etapa: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.etapa)),
    disciplina: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.disciplina)),
    servicio: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.servicio)),
    tipoObra: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.tipoObra)),
    soloVerificados: normalizeBoolean(params.get(SEARCH_FILTER_QUERY_KEYS.soloVerificados)),
    soloIdentidadVerificada: normalizeBoolean(params.get(SEARCH_FILTER_QUERY_KEYS.soloIdentidadVerificada)),
    soloPortafolioValidado: normalizeBoolean(params.get(SEARCH_FILTER_QUERY_KEYS.soloPortafolioValidado)),
    sort: normalizeSort(params.get(SEARCH_FILTER_QUERY_KEYS.sort)),
    tab: tabFromCategoria ?? normalizeTab(params.get(SEARCH_FILTER_QUERY_KEYS.tab)),
  };
};

export const toSearchParams = (state: SearchFilterState): URLSearchParams => {
  const params = new URLSearchParams();

  if (state.q) params.set(SEARCH_FILTER_QUERY_KEYS.q, state.q);
  if (state.categoria) params.set(SEARCH_FILTER_QUERY_KEYS.categoria, state.categoria);
  if (state.ubicacion) params.set(SEARCH_FILTER_QUERY_KEYS.ubicacion, state.ubicacion);
  if (state.tipoProveedor) params.set(SEARCH_FILTER_QUERY_KEYS.tipoProveedor, state.tipoProveedor);
  if (state.etapa) params.set(SEARCH_FILTER_QUERY_KEYS.etapa, state.etapa);
  if (state.disciplina) params.set(SEARCH_FILTER_QUERY_KEYS.disciplina, state.disciplina);
  if (state.servicio) params.set(SEARCH_FILTER_QUERY_KEYS.servicio, state.servicio);
  if (state.tipoObra) params.set(SEARCH_FILTER_QUERY_KEYS.tipoObra, state.tipoObra);
  if (state.soloVerificados) params.set(SEARCH_FILTER_QUERY_KEYS.soloVerificados, "1");
  if (state.soloIdentidadVerificada) params.set(SEARCH_FILTER_QUERY_KEYS.soloIdentidadVerificada, "1");
  if (state.soloPortafolioValidado) params.set(SEARCH_FILTER_QUERY_KEYS.soloPortafolioValidado, "1");
  if (state.sort !== "relevancia") params.set(SEARCH_FILTER_QUERY_KEYS.sort, state.sort);
  if (state.tab !== "servicios") params.set(SEARCH_FILTER_QUERY_KEYS.tab, state.tab);

  return params;
};

export const patchSearchFilterState = (
  current: SearchFilterState,
  patch: Partial<SearchFilterState>,
): SearchFilterState => ({
  ...current,
  ...patch,
});

export const countActiveStructuredFilters = (state: SearchFilterState) =>
  [
    state.categoria,
    state.ubicacion,
    state.tipoProveedor,
    state.etapa,
    state.disciplina,
    state.servicio,
    state.tipoObra,
    state.soloVerificados ? "1" : "",
    state.soloIdentidadVerificada ? "1" : "",
    state.soloPortafolioValidado ? "1" : "",
  ].filter(Boolean).length;

export const clearStructuredFilters = (state: SearchFilterState): SearchFilterState => ({
  ...state,
  categoria: "",
  ubicacion: "",
  tipoProveedor: "",
  etapa: "",
  disciplina: "",
  servicio: "",
  tipoObra: "",
  soloVerificados: false,
  soloIdentidadVerificada: false,
  soloPortafolioValidado: false,
  sort: "relevancia",
});
