import { supabase } from "@/integrations/supabase/client";
import {
  CANONICAL_DISCIPLINES,
  CANONICAL_SERVICES,
  CANONICAL_WORK_TYPES,
  type CanonicalDisciplineSlug,
  type CanonicalServiceSlug,
  type CanonicalStageSlug,
  type CanonicalWorkTypeSlug,
} from "@/lib/taxonomy";

export interface TaxonomyDisciplineRecord {
  id: number;
  slug: CanonicalDisciplineSlug | string;
  name: string;
  stageId: number;
}

export interface TaxonomyServiceRecord {
  id: number;
  slug: CanonicalServiceSlug | string;
  name: string;
  stageId: number;
  disciplineId: number;
}

export interface TaxonomyWorkTypeRecord {
  id: number;
  code: CanonicalWorkTypeSlug | string;
  name: string;
}

export interface TaxonomyCatalog {
  disciplines: TaxonomyDisciplineRecord[];
  services: TaxonomyServiceRecord[];
  workTypes: TaxonomyWorkTypeRecord[];
}

const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

const stageSlugToIdFallback: Record<CanonicalStageSlug, number> = {
  planificacion: 101,
  construccion: 102,
  mantenimiento: 103,
};

const fallbackCatalog: TaxonomyCatalog = {
  disciplines: CANONICAL_DISCIPLINES.map((item, index) => ({
    id: index + 1,
    slug: item.slug,
    name: item.label,
    stageId: stageSlugToIdFallback[item.stageSlug],
  })),
  services: CANONICAL_SERVICES.map((item, index) => ({
    id: index + 1,
    slug: item.slug,
    name: item.label,
    stageId: stageSlugToIdFallback[item.stageSlug],
    disciplineId:
      CANONICAL_DISCIPLINES.findIndex((discipline) => discipline.slug === item.disciplineSlug) + 1,
  })),
  workTypes: CANONICAL_WORK_TYPES.map((item, index) => ({
    id: index + 1,
    code: item.slug,
    name: item.label,
  })),
};

export const fetchTaxonomyCatalog = async (): Promise<TaxonomyCatalog> => {
  if (!hasSupabaseConfig) {
    return fallbackCatalog;
  }

  const [disciplinesRes, servicesRes, workTypesRes] = await Promise.all([
    (supabase.from as any)("disciplines")
      .select("id,slug,name,stage_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    (supabase.from as any)("services")
      .select("id,slug,name,stage_id,discipline_id")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    (supabase.from as any)("work_types")
      .select("id,code,name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (
    disciplinesRes.error ||
    servicesRes.error ||
    workTypesRes.error ||
    !Array.isArray(disciplinesRes.data) ||
    !Array.isArray(servicesRes.data) ||
    !Array.isArray(workTypesRes.data)
  ) {
    return fallbackCatalog;
  }

  return {
    disciplines: disciplinesRes.data.map((row: any) => ({
      id: Number(row.id),
      slug: row.slug,
      name: row.name,
      stageId: Number(row.stage_id),
    })),
    services: servicesRes.data.map((row: any) => ({
      id: Number(row.id),
      slug: row.slug,
      name: row.name,
      stageId: Number(row.stage_id),
      disciplineId: Number(row.discipline_id),
    })),
    workTypes: workTypesRes.data.map((row: any) => ({
      id: Number(row.id),
      code: row.code,
      name: row.name,
    })),
  };
};
