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
    pillClassName: "border-sky-400/40 bg-sky-500/10 text-sky-200",
    accentClassName: "text-sky-300",
    frameClassName: "border-sky-500/25 bg-sky-500/5",
  },
  construccion: {
    family: "construccion",
    label: "Construccion",
    pillClassName: "border-amber-400/40 bg-amber-500/10 text-amber-200",
    accentClassName: "text-amber-300",
    frameClassName: "border-amber-500/25 bg-amber-500/5",
  },
  ingenieria: {
    family: "ingenieria",
    label: "Ingenieria",
    pillClassName: "border-indigo-400/40 bg-indigo-500/10 text-indigo-200",
    accentClassName: "text-indigo-300",
    frameClassName: "border-indigo-500/25 bg-indigo-500/5",
  },
  terminaciones: {
    family: "terminaciones",
    label: "Terminaciones",
    pillClassName: "border-pink-400/40 bg-pink-500/10 text-pink-200",
    accentClassName: "text-pink-300",
    frameClassName: "border-pink-500/25 bg-pink-500/5",
  },
  instalaciones: {
    family: "instalaciones",
    label: "Instalaciones",
    pillClassName: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    accentClassName: "text-emerald-300",
    frameClassName: "border-emerald-500/25 bg-emerald-500/5",
  },
  materiales: {
    family: "materiales",
    label: "Materiales",
    pillClassName: "border-violet-400/40 bg-violet-500/10 text-violet-200",
    accentClassName: "text-violet-300",
    frameClassName: "border-violet-500/25 bg-violet-500/5",
  },
  general: {
    family: "general",
    label: "Servicios",
    pillClassName: "border-slate-500/40 bg-slate-500/10 text-slate-200",
    accentClassName: "text-slate-300",
    frameClassName: "border-slate-600/30 bg-slate-500/5",
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
