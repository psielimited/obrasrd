import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProviders } from "@/hooks/use-marketplace-data";

const CATEGORY_PILLS = [
  { label: "Todos", slug: null },
  { label: "Arquitectos", slug: "arquitectos" },
  { label: "Ingenieros", slug: "ingenieros-estructurales" },
  { label: "Contratistas", slug: "contratistas-generales" },
  { label: "Suplidores", slug: "materiales" },
  { label: "Electricistas", slug: "electricistas" },
] as const;

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: providers = [] } = useProviders();

  const providerCount = providers.length;
  const totalProjects = useMemo(
    () => providers.reduce((sum, provider) => sum + provider.completedProjects, 0),
    [providers],
  );
  const uniqueCities = useMemo(
    () => new Set(providers.map((provider) => provider.city)).size,
    [providers],
  );
  const ratingAvg = useMemo(() => {
    if (providers.length === 0) return 0;
    const sum = providers.reduce((acc, provider) => acc + provider.rating, 0);
    return sum / providers.length;
  }, [providers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleViewServices = () => {
    navigate("/buscar");
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-foreground">
      <div className="relative flex min-h-[100svh] flex-col">
        <img
          aria-hidden
          src="/hero-doodle-kids.svg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom opacity-[0.07] mix-blend-luminosity pointer-events-none select-none"
        />

        {/* Category pills */}
        <div className="relative z-10 mt-20 flex gap-2 overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-24 md:px-8">
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => {
                if (pill.slug) {
                  navigate(`/buscar?categoria=${encodeURIComponent(pill.slug)}`);
                } else {
                  navigate("/buscar");
                }
              }}
              className="shrink-0 rounded-full border border-background/20 bg-transparent px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-background/60 transition active:scale-95 active:border-background/60 active:bg-background/15 active:text-background hover:border-background/40 hover:text-background/80"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 mt-auto px-6 pb-6 md:px-8 md:pb-8">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-background/30">
            República Dominicana
          </p>

          <h1 className="text-[38px] font-black leading-[1.02] tracking-tight text-background md:text-[52px]">
            Encuentra
            <br />
            profesionales
            <br />
            para tu <span className="text-accent">obra.</span>
          </h1>

          <p className="mb-7 mt-3 max-w-[30rem] text-[15px] leading-relaxed text-background/50">
            Arquitectos, ingenieros, contratistas y suplidores verificados en un solo lugar.
          </p>

          <form onSubmit={handleSearch} className="mb-3">
            <div className="flex items-center overflow-hidden rounded-xl bg-background shadow-2xl">
              <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ej: Arquitecto, ingeniero..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-12 w-full bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="sm"
                className="mr-1.5 h-9 rounded-lg px-4 text-[11px] font-bold uppercase tracking-[0.08em]"
              >
                Buscar
              </Button>
            </div>
          </form>

          <div className="flex gap-2.5">
            <Button
              className="h-12 flex-1 rounded-xl border border-background/20 bg-background text-[11px] font-bold uppercase tracking-[0.08em] text-foreground hover:bg-background/90"
              onClick={handleViewServices}
            >
              Ver servicios
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-1 rounded-xl border-background/20 bg-transparent text-[11px] font-bold uppercase tracking-[0.08em] text-background/70 hover:bg-background/10 hover:text-background"
              onClick={() => navigate("/publicar")}
            >
              Publicar servicio
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 grid grid-cols-4 items-center border-t border-background/10 px-3 py-3">
          <div className="text-center">
            <p className="text-base font-extrabold text-background">{providerCount || "-"}</p>
            <p className="text-[9px] uppercase tracking-[0.07em] text-background/40">Profesionales</p>
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold text-background">{totalProjects || "-"}</p>
            <p className="text-[9px] uppercase tracking-[0.07em] text-background/40">Proyectos</p>
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold text-background">{uniqueCities || "-"}</p>
            <p className="text-[9px] uppercase tracking-[0.07em] text-background/40">Ciudades</p>
          </div>
          <div className="text-center">
            <p className="text-base font-extrabold text-background">{ratingAvg ? `${ratingAvg.toFixed(1)} ★` : "-"}</p>
            <p className="text-[9px] uppercase tracking-[0.07em] text-background/40">Promedio</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
