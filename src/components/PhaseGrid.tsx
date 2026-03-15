import { useNavigate } from "react-router-dom";
import { usePhases } from "@/hooks/use-marketplace-data";

const PhaseGrid = () => {
  const navigate = useNavigate();
  const { data: phases = [] } = usePhases();

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="container max-w-5xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Fases de construcción
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map((phase) =>
          <button
            key={phase.id}
            onClick={() => navigate(`/fase/${phase.slug}`)}
            className="group relative bg-card p-5 rounded-xl obra-shadow hover:obra-shadow-md transition-shadow cursor-pointer text-left">
            
              <span className="absolute top-4 right-4 text-5xl font-black select-none leading-none text-neutral-400">
                {String(phase.id).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-1 pr-12">{phase.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {phase.categories.slice(0, 3).map((cat) =>
              <span
                key={cat.slug}
                className="text-[10px] font-bold px-2 py-1 bg-muted rounded uppercase tracking-wide text-muted-foreground">
                
                    {cat.name}
                  </span>
              )}
                {phase.categories.length > 3 &&
              <span className="text-[10px] font-bold px-2 py-1 bg-muted rounded uppercase tracking-wide text-muted-foreground">
                    +{phase.categories.length - 3}
                  </span>
              }
              </div>
            </button>
          )}
        </div>
      </div>
    </section>);

};

export default PhaseGrid;