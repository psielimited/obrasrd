import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePhases } from "@/hooks/use-marketplace-data";
import ProjectPhaseCard from "@/components/ProjectPhaseCard";

const ProjectBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<number[]>([]);
  const { data: phases = [] } = usePhases();

  const projectTypes = [
    "Casa Residencial",
    "Apartamento",
    "Villa Turística",
    "Local Comercial",
    "Edificio Multifamiliar",
    "Nave Industrial",
  ];

  const togglePhase = (id: number) => {
    setSelectedPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            Crear Proyecto
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Organiza tu construcción por fases y encuentra los proveedores que necesitas.
          </p>

          {/* Progress */}
          <div className="flex gap-1 mb-8">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-accent" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Nombre del proyecto
              </label>
              <input
                type="text"
                placeholder="Ej: Casa en Jarabacoa"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow focus:ring-2 focus:ring-accent outline-none transition-all text-foreground placeholder:text-muted-foreground mb-6"
              />
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={!projectName.trim()}
                onClick={() => setStep(1)}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Tipo de proyecto
              </label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {projectTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setProjectType(type)}
                    className={`p-4 rounded-xl text-left text-sm font-semibold transition-all ${
                      projectType === type
                        ? "bg-foreground text-background"
                        : "bg-card obra-shadow text-foreground hover:obra-shadow-md"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={!projectType}
                onClick={() => setStep(2)}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Selecciona las fases necesarias
              </label>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {phases.map((phase) => (
                  <ProjectPhaseCard
                    key={phase.id}
                    phaseId={phase.id}
                    phaseName={phase.name}
                    description={phase.description}
                    disciplineLabel={phase.categories[0]?.name ?? "Sin disciplina"}
                    selected={selectedPhases.includes(phase.id)}
                    onToggle={() => togglePhase(phase.id)}
                  />
                ))}
              </div>
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                disabled={selectedPhases.length === 0}
                onClick={() => setStep(3)}
              >
                Ver resumen
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="bg-card p-6 rounded-xl obra-shadow mb-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{projectName}</h2>
                <p className="text-sm text-muted-foreground mb-4">{projectType}</p>

                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Fases seleccionadas
                </h3>
                <div className="space-y-3">
                  {selectedPhases.sort().map((phaseId) => {
                    const phase = phases.find((item) => item.id === phaseId);
                    if (!phase) return null;
                    return (
                      <div key={phase.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">
                            {String(phase.id).padStart(2, "0")}
                          </span>
                          <h4 className="text-sm font-bold text-foreground">{phase.name}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {phase.categories.map((cat) => (
                            <span
                              key={cat.slug}
                              className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded text-muted-foreground"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="accent"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/buscar`)}
                >
                  Ver proveedores recomendados
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(0)}
                >
                  Nuevo proyecto
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBuilder;
