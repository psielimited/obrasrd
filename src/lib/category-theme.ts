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
    pillClassName: "border-sky-700 bg-sky-100 text-sky-900 dark:border-sky-400/60 dark:bg-sky-500/20 dark:text-sky-100",
    accentClassName: "text-sky-200 dark:text-sky-100",
    frameClassName: "border-sky-700/40 bg-sky-100/60 dark:border-sky-500/35 dark:bg-sky-500/10",
  },
  construccion: {
    family: "construccion",
    label: "Construccion",
    pillClassName: "border-amber-700 bg-amber-100 text-amber-950 dark:border-amber-400/60 dark:bg-amber-500/20 dark:text-amber-100",
    accentClassName: "text-amber-200 dark:text-amber-100",
    frameClassName: "border-amber-700/35 bg-amber-100/55 dark:border-amber-500/35 dark:bg-amber-500/10",
  },
  ingenieria: {
    family: "ingenieria",
    label: "Ingenieria",
    pillClassName: "border-indigo-700 bg-indigo-100 text-indigo-950 dark:border-indigo-400/60 dark:bg-indigo-500/20 dark:text-indigo-100",
    accentClassName: "text-indigo-200 dark:text-indigo-100",
    frameClassName: "border-indigo-700/35 bg-indigo-100/55 dark:border-indigo-500/35 dark:bg-indigo-500/10",
  },
  terminaciones: {
    family: "terminaciones",
    label: "Terminaciones",
    pillClassName: "border-pink-700 bg-pink-100 text-pink-950 dark:border-pink-400/60 dark:bg-pink-500/20 dark:text-pink-100",
    accentClassName: "text-pink-200 dark:text-pink-100",
    frameClassName: "border-pink-700/35 bg-pink-100/55 dark:border-pink-500/35 dark:bg-pink-500/10",
  },
  instalaciones: {
    family: "instalaciones",
    label: "Instalaciones",
    pillClassName: "border-emerald-700 bg-emerald-100 text-emerald-950 dark:border-emerald-400/60 dark:bg-emerald-500/20 dark:text-emerald-100",
    accentClassName: "text-emerald-200 dark:text-emerald-100",
    frameClassName: "border-emerald-700/35 bg-emerald-100/55 dark:border-emerald-500/35 dark:bg-emerald-500/10",
  },
  materiales: {
    family: "materiales",
    label: "Materiales",
    pillClassName: "border-violet-700 bg-violet-100 text-violet-950 dark:border-violet-400/60 dark:bg-violet-500/20 dark:text-violet-100",
    accentClassName: "text-violet-200 dark:text-violet-100",
    frameClassName: "border-violet-700/35 bg-violet-100/55 dark:border-violet-500/35 dark:bg-violet-500/10",
  },
  general: {
    family: "general",
    label: "Servicios",
    pillClassName: "border-slate-600 bg-slate-100 text-slate-900 dark:border-slate-500/70 dark:bg-slate-700/40 dark:text-slate-100",
    accentClassName: "text-slate-200 dark:text-slate-100",
    frameClassName: "border-slate-600/40 bg-slate-100/55 dark:border-slate-500/35 dark:bg-slate-700/15",
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
