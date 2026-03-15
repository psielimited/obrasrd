import HeroSearch from "@/components/HeroSearch";
import PhaseGrid from "@/components/PhaseGrid";
import PopularCategories from "@/components/PopularCategories";
import HowItWorks from "@/components/HowItWorks";
import ProviderCard from "@/components/ProviderCard";
import { useProviders } from "@/hooks/use-marketplace-data";

const Index = () => {
  const { data: providers = [] } = useProviders();
  const featuredProviders = providers.filter((provider) => provider.verified).slice(0, 4);

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <HeroSearch />
      <PhaseGrid />
      <PopularCategories />

      <section className="px-4 py-8 md:py-12">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Proveedores destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <footer className="px-4 py-8 border-t border-border">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-lg font-black tracking-tight text-foreground">ObrasRD</p>
              <p className="text-xs text-muted-foreground">
                El marketplace de construccion de Republica Dominicana.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 ObrasRD. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
