export const PUBLIC_ROUTES = {
  home: "/",
  directorio: "/directorio",
  empresas: "/empresas",
  conocimiento: "/conocimiento",
  conocimientoDetail: (slug: string) => `/conocimiento/${slug}`,
  materiales: "/materiales",
  perfil: "/perfil",
} as const;

export const LEGACY_PUBLIC_ROUTE_ALIASES = {
  buscar: "/buscar",
  publicar: "/publicar",
  guias: "/guias",
} as const;

export const PRIMARY_PUBLIC_NAV_ITEMS = [
  { to: PUBLIC_ROUTES.directorio, label: "Directorio" },
  { to: PUBLIC_ROUTES.empresas, label: "Empresas" },
  { to: PUBLIC_ROUTES.conocimiento, label: "Conocimiento" },
] as const;
