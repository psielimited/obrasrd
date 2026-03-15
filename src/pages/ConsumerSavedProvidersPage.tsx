import { Heart } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import SectionCard from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMySavedProviders, savedProvidersQueryKeys } from "@/hooks/use-saved-providers-data";
import { unsaveProvider } from "@/lib/saved-providers-api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ConsumerSavedProvidersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: savedProviders = [], isLoading } = useMySavedProviders();

  const onRemove = async (providerId: string) => {
    try {
      await unsaveProvider(providerId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.list }),
        queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.ids }),
      ]);
      toast({ title: "Eliminado", description: "Proveedor removido de guardados." });
    } catch (error) {
      toast({
        title: "No se pudo eliminar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <ConsumerDashboardLayout
      title="Proveedores guardados"
      subtitle="Compara tus opciones favoritas antes de decidir"
      actionLabel="Acciones"
      onAction={() => navigate("/buscar")}
    >
      {isLoading ? (
        <SectionCard title="Cargando" description="Obteniendo tus proveedores guardados...">
          <p className="text-sm text-slate-400">Cargando...</p>
        </SectionCard>
      ) : savedProviders.length === 0 ? (
        <EmptyState
          title="Aun no tienes guardados"
          description="Guarda perfiles desde el marketplace para revisarlos y compararlos aqui."
          icon={Heart}
          action={
            <Button variant="accent" onClick={() => navigate("/buscar")}>Explorar marketplace</Button>
          }
        />
      ) : (
        <SectionCard title="Mis guardados" description={`Total: ${savedProviders.length}`}>
          <div className="space-y-3">
            {savedProviders.map(({ provider, createdAt }) => (
              <div key={provider.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{provider.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{provider.trade} • {provider.city}</p>
                  <p className="text-xs text-slate-500 mt-1">Guardado: {new Date(createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/proveedor/${provider.id}`)}>
                    Ver perfil
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onRemove(provider.id)}>
                    Quitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </ConsumerDashboardLayout>
  );
};

export default ConsumerSavedProvidersPage;
