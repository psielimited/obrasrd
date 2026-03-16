import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HERO_VARIANTS = [
  "/hero-doodle-construction.svg",
  "/hero-doodle-construction-b.svg",
  "/hero-doodle-construction-c.svg",
];

const getHeroVariant = () => {
  const now = new Date();
  const dayStart = Date.UTC(now.getUTCFullYear(), 0, 0);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayOfYear = Math.floor((today - dayStart) / (1000 * 60 * 60 * 24));
  return HERO_VARIANTS[dayOfYear % HERO_VARIANTS.length];
};

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const heroBackground = getHeroVariant();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-background px-4 pt-12 pb-8 md:pt-20 md:pb-12">
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url('${heroBackground}')` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/97 via-background/95 to-background md:from-background/92 md:via-background/86 md:to-background/92" />
      <div aria-hidden className="absolute inset-0 bg-slate-950/24 md:bg-slate-950/14" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.10),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.10),transparent_42%)] md:bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.08),transparent_45%)]" />

      <div className="container relative max-w-2xl mx-auto text-center">
        <div className="rounded-2xl border border-border/75 bg-background/90 px-4 py-6 shadow-xl backdrop-blur-sm md:border-border/60 md:bg-background/74 md:px-8 md:py-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Encuentra profesionales y materiales para tu construccion.
          </h1>
          <p className="mb-8 text-base text-muted-foreground">
            Arquitectos, ingenieros, contratistas y suplidores en un solo lugar.
          </p>

          <form onSubmit={handleSearch} className="w-full">
            <label className="mb-2 block text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Que necesitas construir?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ej: Arquitecto, concreto, electricista"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-lg border border-border/80 bg-background/95 py-3 pl-10 pr-4 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                />
              </div>
              <Button type="submit" variant="default" size="lg">
                Buscar
              </Button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="accent" size="lg" onClick={() => navigate("/buscar")}>
              Buscar servicios
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/publicar")}>
              Publicar servicio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
