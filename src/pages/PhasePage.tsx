import { useParams, useNavigate } from "react-router-dom";
import ProviderCard from "@/components/ProviderCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePhases, useProviderSummaries } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";

const PhasePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: phases = [] } = usePhases();
  const { data: providers = [] } = useProviderSummaries();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();
  const phase = phases.find((item) => item.slug === slug);

  if (!phase) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Fase no encontrada.</p>
      </div>
    );
  }

  const phaseProviders = providers.filter((provider) => provider.phaseId === phase.id);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl font-black text-muted-foreground/30">
              {String(phase.id).padStart(2, "0")}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{phase.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{phase.description}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {phase.categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="text-xs font-bold px-3 py-1.5 bg-card obra-shadow rounded-lg uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>

          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Proveedores en esta fase ({phaseProviders.length})
          </h2>

          {phaseProviders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {phaseProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  phases={phases}
                  taxonomyCatalog={taxonomyCatalog}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card p-8 rounded-xl obra-shadow text-center">
              <p className="text-sm text-muted-foreground">
                No hay proveedores registrados en esta fase todavía.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhasePage;
