import MaterialCard from "@/components/MaterialCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMaterials } from "@/hooks/use-marketplace-data";

const MaterialsPage = () => {
  const navigate = useNavigate();
  const { data: materials = [] } = useMaterials();
  const categories = [...new Set(materials.map((material) => material.category))];

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-5xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            Materiales de Construcción
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Cemento, varilla, blocks, arena y más. Contacta directo al suplidor.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-xs font-bold px-3 py-1.5 bg-card obra-shadow rounded-lg uppercase tracking-wide text-muted-foreground"
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
