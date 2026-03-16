import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSearch = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

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
        style={{ backgroundImage: "url('/hero-construction.svg')" }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-background/92 via-background/88 to-background" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(30,64,175,0.12),transparent_45%)]" />

      <div className="container relative max-w-2xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          Encuentra profesionales y materiales para tu construcción.
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Arquitectos, ingenieros, contratistas y suplidores en un solo lugar.
        </p>

        <form onSubmit={handleSearch} className="w-full">
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 text-left">
            ¿Qué necesitas construir?
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ej: Arquitecto, concreto, electricista"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card obra-shadow focus:ring-2 focus:ring-accent outline-none transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" variant="default" size="lg">
              Buscar
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <Button variant="accent" size="lg" onClick={() => navigate("/buscar")}>
            Buscar servicios
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/publicar")}>
            Publicar servicio
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSearch;
