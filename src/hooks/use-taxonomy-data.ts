import { useQuery } from "@tanstack/react-query";
import { fetchTaxonomyCatalog } from "@/lib/taxonomy-api";

export const taxonomyQueryKeys = {
  catalog: ["taxonomy", "catalog"] as const,
};

export const useTaxonomyCatalog = () =>
  useQuery({
    queryKey: taxonomyQueryKeys.catalog,
    queryFn: fetchTaxonomyCatalog,
  });
