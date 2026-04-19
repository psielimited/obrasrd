export const PUBLIC_ROUTES = {
  home: "/",
  directorio: "/directorio",
  empresas: "/empresas",
  conocimiento: "/conocimiento",
  conocimientoDetail: (slug: string) => `/conocimiento/${slug}`,
  materiales: "/materiales",
  proyectosReales: "/proyectos/reales",
  proyectosRealesDetail: (projectId: string) => `/proyectos/reales/${projectId}`,
  perfil: "/perfil",
} as const;

export const LEGACY_PUBLIC_ROUTE_ALIASES = {
  buscar: "/buscar",
  publicar: "/publicar",
  guias: "/guias",
} as const;

export const PRIMARY_PUBLIC_NAV_ITEMS = [
  { to: PUBLIC_ROUTES.directorio, label: "Directorio" },
  { to: PUBLIC_ROUTES.conocimiento, label: "Guias" },
] as const;

/**
 * Builds the canonical public href for a provider profile.
 * Prefers the human-readable slug when present, falling back to the UUID.
 */
export const getProviderHref = (
  provider: { id: string; slug?: string | null } | null | undefined,
): string => {
  if (!provider?.id) return PUBLIC_ROUTES.directorio;
  const slug = provider.slug?.trim();
  return `/proveedor/${slug && slug.length > 0 ? slug : provider.id}`;
};

