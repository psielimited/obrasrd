export type CategoryFamily =
  | "diseno"
  | "construccion"
  | "ingenieria"
  | "terminaciones"
  | "instalaciones"
  | "materiales"
  | "general";

export interface CategoryTheme {
  family: CategoryFamily;
  label: string;
  pillClassName: string;
  accentClassName: string;
  frameClassName: string;
}

const CATEGORY_GROUPS: Record<CategoryFamily, string[]> = {
  diseno: [
    "arquitectos",
    "disenadores-interiores",
    "agentes-inmobiliarios",
  ],
  construccion: [
    "contratistas-generales",
    "albaniles",
    "excavacion",
    "limpieza-terrenos",
    "movimiento-tierra",
    "concreto",
    "cimentacion",
    "paisajismo",
    "pavimentacion",
    "portones",
    "limpieza",
  ],
  ingenieria: [
    "ingenieros-estructurales",
    "ingenieros-mep",
    "ingenieros-civiles",
    "agrimensores",
    "consultores-ambientales",
    "inspectores",
    "abogados-inmobiliarios",
    "gestores-permisos",
  ],
  terminaciones: [
    "pintores",
    "instaladores-pisos",
    "carpinteria-interior",
    "gabinetes",
    "drywall",
    "vidrieros",
    "stucco",
    "acabados-exteriores",
    "carpinteros-estructura",
  ],
  instalaciones: [
    "electricistas",
    "plomeros",
    "hvac",
    "paneles-solares",
    "redes-cableado",
    "servicios-publicos",
    "contratistas-techos",
    "aislamiento",
  ],
  materiales: ["materiales"],
  general: [],
};

const FAMILY_THEME: Record<CategoryFamily, CategoryTheme> = {
  diseno: {
    family: "diseno",
    label: "Diseno",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
  construccion: {
    family: "construccion",
    label: "Construccion",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
  ingenieria: {
    family: "ingenieria",
    label: "Ingenieria",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
  terminaciones: {
    family: "terminaciones",
    label: "Terminaciones",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
  instalaciones: {
    family: "instalaciones",
    label: "Instalaciones",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
  materiales: {
    family: "materiales",
    label: "Materiales",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
  general: {
    family: "general",
    label: "Servicios",
    pillClassName: "border-border bg-background text-foreground",
    accentClassName: "text-muted-foreground",
    frameClassName: "border-border bg-muted/50",
  },
};

const CATEGORY_TO_FAMILY = Object.entries(CATEGORY_GROUPS).reduce<Record<string, CategoryFamily>>(
  (acc, [family, slugs]) => {
    for (const slug of slugs) {
      acc[slug] = family as CategoryFamily;
    }
    return acc;
  },
  {},
);

export const getCategoryTheme = (categorySlug?: string | null): CategoryTheme => {
  if (!categorySlug) return FAMILY_THEME.general;
  const family = CATEGORY_TO_FAMILY[categorySlug] ?? "general";
  return FAMILY_THEME[family];
};
