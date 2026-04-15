export type SearchTab = "servicios" | "materiales";

export interface SearchFilterState {
  q: string;
  categoria: string;
  etapa: string;
  disciplina: string;
  servicio: string;
  tipoObra: string;
  tab: SearchTab;
}

export const SEARCH_FILTER_QUERY_KEYS = {
  q: "q",
  categoria: "categoria",
  etapa: "etapa",
  disciplina: "disciplina",
  servicio: "servicio",
  tipoObra: "tipo_obra",
  tab: "tab",
} as const;

const normalizeTab = (value: string | null): SearchTab => {
  if (value === "materiales") return "materiales";
  return "servicios";
};

const normalizeValue = (value: string | null) => (value ?? "").trim();

export const parseSearchFilterState = (params: URLSearchParams): SearchFilterState => {
  const categoria = normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.categoria));
  const tabFromCategoria = categoria === "materiales" ? "materiales" : undefined;

  return {
    q: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.q)),
    categoria,
    etapa: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.etapa)),
    disciplina: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.disciplina)),
    servicio: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.servicio)),
    tipoObra: normalizeValue(params.get(SEARCH_FILTER_QUERY_KEYS.tipoObra)),
    tab: tabFromCategoria ?? normalizeTab(params.get(SEARCH_FILTER_QUERY_KEYS.tab)),
  };
};

export const toSearchParams = (state: SearchFilterState): URLSearchParams => {
  const params = new URLSearchParams();

  if (state.q) params.set(SEARCH_FILTER_QUERY_KEYS.q, state.q);
  if (state.categoria) params.set(SEARCH_FILTER_QUERY_KEYS.categoria, state.categoria);
  if (state.etapa) params.set(SEARCH_FILTER_QUERY_KEYS.etapa, state.etapa);
  if (state.disciplina) params.set(SEARCH_FILTER_QUERY_KEYS.disciplina, state.disciplina);
  if (state.servicio) params.set(SEARCH_FILTER_QUERY_KEYS.servicio, state.servicio);
  if (state.tipoObra) params.set(SEARCH_FILTER_QUERY_KEYS.tipoObra, state.tipoObra);
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
  [state.categoria, state.etapa, state.disciplina, state.servicio, state.tipoObra].filter(Boolean).length;

export const clearStructuredFilters = (state: SearchFilterState): SearchFilterState => ({
  ...state,
  categoria: "",
  etapa: "",
  disciplina: "",
  servicio: "",
  tipoObra: "",
});
