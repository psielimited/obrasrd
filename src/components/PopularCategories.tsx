import { useNavigate } from "react-router-dom";
import { usePopularCategories } from "@/hooks/use-marketplace-data";

const PopularCategories = () => {
  const navigate = useNavigate();
  const { data: popularCategories = [] } = usePopularCategories();

  return (
    <section className="px-4 py-8 md:py-12 bg-muted/50">
      <div className="container max-w-5xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Categorías populares
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {popularCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
              className="rounded-xl border border-border/80 bg-card p-4 text-left transition-shadow hover:obra-shadow-md group"
            >
              <h3 className="text-sm font-bold text-foreground">{cat.name}</h3>
              <p className="text-xs text-muted-foreground font-tabular">{cat.count} proveedores</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
