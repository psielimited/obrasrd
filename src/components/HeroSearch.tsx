import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProviders } from "@/hooks/use-marketplace-data";

const HERO_BG =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80&auto=format&fit=crop";

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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
    if (activeCategory) {
      navigate(`/buscar?categoria=${encodeURIComponent(activeCategory)}`);
      return;
    }
    navigate("/buscar");
  };

  return (
    <section className="bg-[#F0EDE7] px-4 pb-8 pt-6 md:pb-12 md:pt-8">
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[30px] border border-[#2A221A]/30 bg-[#1A1612] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-30 saturate-50"
            style={{ backgroundImage: `url('${HERO_BG}')` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,10,5,0.74)_0%,rgba(15,10,5,0.14)_30%,rgba(15,10,5,0.2)_45%,rgba(15,10,5,0.84)_68%,rgba(15,10,5,0.97)_100%)]"
          />

          <div className="relative z-10 flex min-h-[640px] flex-col">
            <div className="flex items-center justify-between px-6 pt-6 md:px-8 md:pt-7">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Obras<span className="text-[#C4773B]">RD</span>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white/20 bg-[#C4773B] text-[11px] font-bold text-white">
                OB
              </span>
            </div>

            <div className="no-scrollbar relative mt-5 flex gap-2 overflow-x-auto px-6 md:px-8">
              {CATEGORY_PILLS.map((pill) => {
                const isActive = activeCategory === pill.slug;
                return (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => setActiveCategory(pill.slug)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                      isActive
                        ? "border-[#C4773B] bg-[#C4773B] text-white"
                        : "border-white/20 bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto px-6 pb-6 md:px-8 md:pb-7">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-[2px] w-6 rounded bg-[#C4773B]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C4773B]">
                  Republica Dominicana
                </span>
              </div>

              <h1 className="text-[36px] font-extrabold leading-[1.03] tracking-tight text-white md:text-[48px]">
                Encuentra
                <br />
                profesionales
                <br />
                para tu <span className="text-[#E8945A]">obra.</span>
              </h1>

              <p className="mb-6 mt-3 max-w-[32rem] text-sm leading-relaxed text-white/60">
                Arquitectos, ingenieros, contratistas y suplidores verificados en un solo lugar.
              </p>

              <form onSubmit={handleSearch} className="mb-3">
                <div className="flex items-center overflow-hidden rounded-xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <Search className="ml-4 h-4 w-4 shrink-0 text-[#7A6E64]" />
                  <input
                    type="text"
                    placeholder="Ej: Arquitecto, ingeniero..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-12 w-full bg-transparent px-3 text-sm text-[#1A1612] outline-none placeholder:text-[#7A6E64]"
                  />
                  <Button
                    type="submit"
                    className="mr-1.5 h-9 rounded-lg bg-[#1A1612] px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#9E5A24]"
                  >
                    Buscar
                  </Button>
                </div>
              </form>

              <div className="flex gap-2.5">
                <Button
                  variant="accent"
                  className="h-12 flex-1 rounded-xl bg-[#C4773B] text-[11px] uppercase tracking-[0.08em] text-white hover:bg-[#9E5A24]"
                  onClick={handleViewServices}
                >
                  Ver servicios
                </Button>
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-xl border-white/20 bg-white/10 text-[11px] uppercase tracking-[0.08em] text-white/80 hover:bg-white/15 hover:text-white"
                  onClick={() => navigate("/publicar")}
                >
                  Publicar servicio
                </Button>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-4 items-center border-t border-white/10 bg-black/25 px-3 py-3 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-base font-extrabold text-white">{providerCount || "-"}</p>
              <p className="text-[9px] uppercase tracking-[0.07em] text-white/45">Profesionales</p>
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold text-white">{totalProjects || "-"}</p>
              <p className="text-[9px] uppercase tracking-[0.07em] text-white/45">Proyectos</p>
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold text-white">{uniqueCities || "-"}</p>
              <p className="text-[9px] uppercase tracking-[0.07em] text-white/45">Ciudades</p>
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold text-white">{ratingAvg ? `${ratingAvg.toFixed(1)} ★` : "-"}</p>
              <p className="text-[9px] uppercase tracking-[0.07em] text-white/45">Promedio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
