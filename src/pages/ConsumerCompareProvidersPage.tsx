import { useMemo, useState } from "react";
import { ArrowRightLeft, Scale, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import SectionCard from "@/components/dashboard/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMySavedProviders } from "@/hooks/use-saved-providers-data";

const MAX_COMPARE = 4;

const ConsumerCompareProvidersPage = () => {
  const navigate = useNavigate();
  const { data: savedProviders = [], isLoading } = useMySavedProviders();
  const shortlist = useMemo(
    () => savedProviders.filter((item) => item.isShortlisted),
    [savedProviders],
  );
  const initialCandidates = shortlist.length > 0 ? shortlist : savedProviders;
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialCandidates.slice(0, 3).map((item) => item.provider.id),
  );

  const selectedProviders = useMemo(
    () => savedProviders.filter((item) => selectedIds.includes(item.provider.id)),
    [savedProviders, selectedIds],
  );

  const toggleSelected = (providerId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(providerId)) {
        return prev.filter((id) => id !== providerId);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, providerId];
    });
  };

  return (
    <ConsumerDashboardLayout
      title="Comparar proveedores"
      subtitle="Evalua opciones guardadas antes de solicitar cotizacion"
      actionLabel="Acciones"
      onAction={() => navigate("/dashboard/cliente/guardados")}
    >
      <div className="space-y-6">
        {isLoading ? (
          <SectionCard title="Cargando comparador" description="Preparando tus proveedores guardados">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </SectionCard>
        ) : savedProviders.length === 0 ? (
          <EmptyState
            title="No tienes proveedores guardados"
            description="Guarda perfiles en el marketplace para poder compararlos aqui."
            icon={ArrowRightLeft}
            action={
              <Button variant="accent" onClick={() => navigate("/buscar")}>
                Explorar marketplace
              </Button>
            }
          />
        ) : (
          <>
            <SectionCard
              title="Seleccion para comparar"
              description={`Puedes comparar hasta ${MAX_COMPARE} proveedores a la vez`}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {savedProviders.map(({ provider, isShortlisted }) => {
                  const selected = selectedIds.includes(provider.id);
                  return (
                    <div
                      key={provider.id}
                      className={`rounded-xl border p-3 ${
                        selected
                          ? "border-accent/40 bg-accent/10"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {provider.trade} - {provider.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isShortlisted && (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-300">
                              <Star className="h-3 w-3 mr-1" />
                              Shortlist
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            onClick={() => toggleSelected(provider.id)}
                          >
                            {selected ? "Seleccionado" : "Seleccionar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Tabla comparativa"
              description={`Comparando ${selectedProviders.length} proveedor(es)`}
            >
              {selectedProviders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Selecciona al menos un proveedor para comparar.</p>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="text-left py-2 pr-4">Proveedor</th>
                        <th className="text-left py-2 pr-4">Especialidad</th>
                        <th className="text-left py-2 pr-4">Ciudad</th>
                        <th className="text-left py-2 pr-4">Rating</th>
                        <th className="text-left py-2 pr-4">Experiencia</th>
                        <th className="text-left py-2 pr-4">Precio inicial</th>
                        <th className="text-left py-2 pr-4">Cobertura</th>
                        <th className="text-left py-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProviders.map(({ provider }) => (
                        <tr key={provider.id} className="border-b border-border">
                          <td className="py-2 pr-4 text-foreground font-semibold">
                            <div className="flex items-center gap-2">
                              <span>{provider.name}</span>
                              {provider.verified && (
                                <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
                                  Verificado en ObrasRD
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-foreground">{provider.trade}</td>
                          <td className="py-2 pr-4 text-foreground">{provider.city}</td>
                          <td className="py-2 pr-4 text-foreground">{provider.rating.toFixed(1)}</td>
                          <td className="py-2 pr-4 text-foreground">{provider.yearsExperience} anos</td>
                          <td className="py-2 pr-4 text-foreground">
                            {provider.startingPrice
                              ? `RD$${provider.startingPrice.toLocaleString()}`
                              : "N/D"}
                          </td>
                          <td className="py-2 pr-4 text-foreground">
                            {provider.serviceAreas.length} zonas
                          </td>
                          <td className="py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/proveedor/${provider.id}`)}
                            >
                              Ver perfil
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </ConsumerDashboardLayout>
  );
};

export default ConsumerCompareProvidersPage;

