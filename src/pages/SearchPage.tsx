import { useState } from "react";
import ProviderCard from "@/components/ProviderCard";
import MaterialCard from "@/components/MaterialCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMaterials, useProviders } from "@/hooks/use-marketplace-data";
import { getLegacyCategoryTaxonomyMapping, getLegacyTaxonomySearchTerms } from "@/lib/legacy-taxonomy-compat";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("categoria") || "";
  const [query, setQuery] = useState(initialQuery);
  const { data: providers = [] } = useProviders();
  const { data: materials = [] } = useMaterials();
  const [activeTab, setActiveTab] = useState<"servicios" | "materiales">(
    initialCategory === "materiales" ? "materiales" : "servicios"
  );

  const normalizedQuery = query.toLowerCase();

  const filteredProviders = providers.filter(
    (p) => {
      const mapping = getLegacyCategoryTaxonomyMapping(p.categorySlug);
      const taxonomyTerms = getLegacyTaxonomySearchTerms(p.categorySlug);
      const matchesCategoryParam = Boolean(initialCategory) && (
        p.categorySlug === initialCategory ||
        mapping?.serviceSlug === initialCategory ||
        mapping?.disciplineSlug === initialCategory ||
        mapping?.stageSlug === initialCategory
      );

      return (
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.trade.toLowerCase().includes(normalizedQuery) ||
        p.categorySlug.includes(normalizedQuery) ||
        p.location.toLowerCase().includes(normalizedQuery) ||
        taxonomyTerms.some((term) => term.includes(normalizedQuery)) ||
        matchesCategoryParam
      );
    }
  );

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(normalizedQuery) ||
      m.category.toLowerCase().includes(normalizedQuery) ||
      m.supplier.toLowerCase().includes(normalizedQuery)
  );

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Inicio
          </Button>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar servicio o material..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card obra-shadow focus:ring-2 focus:ring-accent outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("servicios")}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                activeTab === "servicios"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Servicios ({filteredProviders.length})
            </button>
            <button
              onClick={() => setActiveTab("materiales")}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${
                activeTab === "materiales"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Materiales ({filteredMaterials.length})
            </button>
          </div>

          {activeTab === "servicios" ? (
            filteredProviders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProviders.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-xl obra-shadow text-center">
                <p className="text-sm text-muted-foreground">No se encontraron servicios.</p>
              </div>
            )
          ) : filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMaterials.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          ) : (
            <div className="bg-card p-8 rounded-xl obra-shadow text-center">
              <p className="text-sm text-muted-foreground">No se encontraron materiales.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
