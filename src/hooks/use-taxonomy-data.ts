import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomyCatalog } from "@/lib/taxonomy-api";
import { CATALOG_QUERY_OPTIONS } from "@/lib/query-options";

export const taxonomyQueryKeys = {
  catalog: ["taxonomy", "catalog"] as const,
};

export const useTaxonomyCatalog = () =>
  useQuery({
    queryKey: taxonomyQueryKeys.catalog,
    queryFn: fetchTaxonomyCatalog,
    ...CATALOG_QUERY_OPTIONS,
  });
