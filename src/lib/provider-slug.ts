import { supabase } from "@/integrations/supabase/client";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "dashboard",
  "auth",
  "proveedor",
  "proveedores",
  "directorio",
  "empresas",
  "materiales",
  "conocimiento",
  "perfil",
  "pricing",
  "nuevo",
  "editar",
  "null",
  "undefined",
  "login",
  "logout",
  "signup",
  "register",
  "settings",
  "configuracion",
  "buscar",
  "publicar",
  "guias",
  "proyectos",
  "about",
  "contacto",
  "help",
  "soporte",
]);

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 40;
export const SLUG_FREE_PLAN_MIN_LENGTH = 8;
export const SLUG_PREMIUM_PLAN_CODES = new Set(["pro", "premium", "elite"]);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;

export type SlugAvailability =
  | { status: "ok" }
  | { status: "invalid"; reason: string }
  | { status: "reserved" }
  | { status: "taken" }
  | { status: "premium-required"; reason: string };

/**
 * ASCII-fold + kebab-case a free-form name into a candidate slug.
 * Strips diacritics, replaces non-alnum with hyphens, trims hyphens.
 */
export const normalizeNameToSlug = (input: string): string => {
  if (!input) return "";
  const folded = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const hyphenated = folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return hyphenated.slice(0, SLUG_MAX_LENGTH);
};

/**
 * Local format validation. Does not check availability or plan gating.
 */
export const validateSlugFormat = (slug: string): SlugAvailability => {
  const value = slug.trim().toLowerCase();
  if (!value) {
    return { status: "invalid", reason: "La URL no puede estar vacia." };
  }
  if (value.length < SLUG_MIN_LENGTH) {
    return { status: "invalid", reason: `Minimo ${SLUG_MIN_LENGTH} caracteres.` };
  }
  if (value.length > SLUG_MAX_LENGTH) {
    return { status: "invalid", reason: `Maximo ${SLUG_MAX_LENGTH} caracteres.` };
  }
  if (value.includes("--")) {
    return { status: "invalid", reason: "No se permiten guiones consecutivos." };
  }
  if (!SLUG_PATTERN.test(value)) {
    return {
      status: "invalid",
      reason: "Usa solo letras minusculas, numeros y guiones (no al inicio ni al final).",
    };
  }
  if (RESERVED_SLUGS.has(value)) {
    return { status: "reserved" };
  }
  return { status: "ok" };
};

/**
 * Plan-aware gating. Free plans require longer slugs to leave short ones for paid tiers.
 */
export const checkSlugPlanAccess = (
  slug: string,
  planCode?: string | null,
): SlugAvailability => {
  const value = slug.trim().toLowerCase();
  const isPremium = planCode ? SLUG_PREMIUM_PLAN_CODES.has(planCode) : false;
  if (!isPremium && value.length < SLUG_FREE_PLAN_MIN_LENGTH) {
    return {
      status: "premium-required",
      reason: `Las URLs de menos de ${SLUG_FREE_PLAN_MIN_LENGTH} caracteres son exclusivas de planes Pro o superior.`,
    };
  }
  return { status: "ok" };
};

/**
 * Checks if a slug is already taken by another provider.
 * Pass `excludeProviderId` to ignore the current provider's own slug.
 */
export const isSlugAvailable = async (
  slug: string,
  excludeProviderId?: string,
): Promise<boolean> => {
  const value = slug.trim().toLowerCase();
  if (!value) return false;

  const query = (supabase.from as any)("providers")
    .select("id")
    .ilike("slug", value)
    .limit(1);

  const { data, error } = await query;
  if (error) {
    // Fail open on read errors — server-side unique index is the source of truth.
    return true;
  }
  if (!data || data.length === 0) return true;
  if (excludeProviderId && data[0].id === excludeProviderId) return true;
  return false;
};

/**
 * Finds the next available slug, trying base, base-2, base-3, ...
 */
export const findAvailableSlug = async (
  baseCandidate: string,
  excludeProviderId?: string,
): Promise<string | null> => {
  const base = normalizeNameToSlug(baseCandidate);
  if (!base) return null;

  // Pad to free-plan minimum length when needed (e.g. "ana" -> "ana-perfil").
  const padded =
    base.length < SLUG_FREE_PLAN_MIN_LENGTH
      ? `${base}-perfil`.slice(0, SLUG_MAX_LENGTH)
      : base;

  const candidates = [padded];
  for (let i = 2; i <= 25; i += 1) {
    const suffix = `-${i}`;
    const trimmed = padded.slice(0, SLUG_MAX_LENGTH - suffix.length);
    candidates.push(`${trimmed}${suffix}`);
  }

  for (const candidate of candidates) {
    if (validateSlugFormat(candidate).status !== "ok") continue;
    // eslint-disable-next-line no-await-in-loop
    const available = await isSlugAvailable(candidate, excludeProviderId);
    if (available) return candidate;
  }

  return null;
};
