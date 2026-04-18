import { PUBLIC_ROUTES } from "@/lib/public-ia";

export interface DirectoryTopicTarget {
  etapa?: string;
  disciplina?: string;
  servicio?: string;
  tipoObra?: string;
  ubicacion?: string;
  q?: string;
}

const setIfPresent = (params: URLSearchParams, key: string, value?: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return;
  params.set(key, trimmed);
};

export const buildDirectoryTopicHref = (target: DirectoryTopicTarget) => {
  const params = new URLSearchParams();

  setIfPresent(params, "etapa", target.etapa);
  setIfPresent(params, "disciplina", target.disciplina);
  setIfPresent(params, "servicio", target.servicio);
  setIfPresent(params, "tipo_obra", target.tipoObra);
  setIfPresent(params, "ubicacion", target.ubicacion);
  setIfPresent(params, "q", target.q);

  const query = params.toString();
  if (!query) return PUBLIC_ROUTES.directorio;
  return `${PUBLIC_ROUTES.directorio}?${query}`;
};
