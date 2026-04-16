import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomyCatalog } from "@/lib/taxonomy-api";
import { CATALOG_QUERY_OPTIONS } from "@/lib/query-options";

export const taxonomyQueryKeys = {
  catalog: ["taxonomy", "catalog"] as const,
};

export const useTaxonomyCatalog = (enabled = true) =>
  useQuery({
    queryKey: taxonomyQueryKeys.catalog,
    queryFn: fetchTaxonomyCatalog,
    enabled,
    ...CATALOG_QUERY_OPTIONS,
  });
