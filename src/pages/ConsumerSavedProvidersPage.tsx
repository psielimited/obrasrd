import { useMemo, useState } from "react";
import { Heart, Scale, Star } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import SectionCard from "@/components/dashboard/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMySavedProviders, savedProvidersQueryKeys } from "@/hooks/use-saved-providers-data";
import { unsaveProvider, updateSavedProviderMeta } from "@/lib/saved-providers-api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ConsumerSavedProvidersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: savedProviders = [], isLoading } = useMySavedProviders();

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [isSavingNoteId, setIsSavingNoteId] = useState<number | null>(null);

  const comparedProviders = useMemo(
    () => savedProviders.filter((item) => compareIds.includes(item.provider.id)),
    [savedProviders, compareIds],
  );

  const refreshSaved = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.list }),
      queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.ids }),
    ]);
  };

  const onRemove = async (providerId: string) => {
    try {
      await unsaveProvider(providerId);
      setCompareIds((prev) => prev.filter((id) => id !== providerId));
      await refreshSaved();
      toast({ title: "Eliminado", description: "Proveedor removido de guardados." });
    } catch (error) {
      toast({
        title: "No se pudo eliminar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const onToggleShortlist = async (savedId: number, currentValue: boolean) => {
    try {
      await updateSavedProviderMeta(savedId, { isShortlisted: !currentValue });
      await refreshSaved();
      toast({
        title: !currentValue ? "Marcado en shortlist" : "Removido de shortlist",
        description: !currentValue ? "Lo dejamos en tu lista corta." : "Ya no esta en shortlist.",
      });
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const onSaveNote = async (savedId: number, currentNote?: string) => {
    const draft = noteDrafts[savedId];
    if (draft === undefined || draft === (currentNote ?? "")) return;

    setIsSavingNoteId(savedId);
    try {
      await updateSavedProviderMeta(savedId, { note: draft });
      await refreshSaved();
      toast({ title: "Nota guardada", description: "Actualizamos tu nota de comparacion." });
    } catch (error) {
      toast({
        title: "No se pudo guardar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSavingNoteId(null);
    }
  };

  const toggleCompare = (providerId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(providerId)) {
        return prev.filter((id) => id !== providerId);
      }
      if (prev.length >= 3) {
        toast({ title: "Maximo 3", description: "Puedes comparar hasta 3 proveedores." });
        return prev;
      }
      return [...prev, providerId];
    });
  };

  return (
    <ConsumerDashboardLayout
      title="Proveedores guardados"
      subtitle="Compara tus opciones favoritas antes de decidir"
      actionLabel="Acciones"
      onAction={() => navigate("/buscar")}
    >
      <div className="space-y-6">
        {comparedProviders.length > 0 && (
          <SectionCard title="Comparador" description={`Comparando ${comparedProviders.length} proveedor(es)`}>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left py-2 pr-3">Proveedor</th>
                    <th className="text-left py-2 pr-3">Ciudad</th>
                    <th className="text-left py-2 pr-3">Rating</th>
                    <th className="text-left py-2 pr-3">Experiencia</th>
                    <th className="text-left py-2 pr-3">Precio inicial</th>
                    <th className="text-left py-2">Areas</th>
                  </tr>
                </thead>
                <tbody>
                  {comparedProviders.map(({ provider }) => (
                    <tr key={provider.id} className="border-b border-slate-900">
                      <td className="py-2 pr-3 text-slate-100 font-semibold">{provider.name}</td>
                      <td className="py-2 pr-3 text-slate-300">{provider.city}</td>
                      <td className="py-2 pr-3 text-slate-300">{provider.rating.toFixed(1)}</td>
                      <td className="py-2 pr-3 text-slate-300">{provider.yearsExperience} anos</td>
                      <td className="py-2 pr-3 text-slate-300">{provider.startingPrice ? `RD$${provider.startingPrice.toLocaleString()}` : "N/D"}</td>
                      <td className="py-2 text-slate-300">{provider.serviceAreas.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {isLoading ? (
          <SectionCard title="Cargando" description="Obteniendo tus proveedores guardados...">
            <p className="text-sm text-slate-400">Cargando...</p>
          </SectionCard>
        ) : savedProviders.length === 0 ? (
          <EmptyState
            title="Aun no tienes guardados"
            description="Guarda perfiles desde el marketplace para revisarlos y compararlos aqui."
            icon={Heart}
            action={<Button variant="accent" onClick={() => navigate("/buscar")}>Explorar marketplace</Button>}
          />
        ) : (
          <SectionCard title="Mis guardados" description={`Total: ${savedProviders.length}`}>
            <div className="space-y-3">
              {savedProviders.map(({ id: savedId, provider, createdAt, note, isShortlisted }) => {
                const noteValue = noteDrafts[savedId] ?? note ?? "";
                const isCompared = compareIds.includes(provider.id);

                return (
                  <div key={provider.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-100">{provider.name}</p>
                          {isShortlisted && <Badge variant="outline" className="border-amber-500/40 text-amber-300">Shortlist</Badge>}
                          {provider.verified && <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">Verificado</Badge>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{provider.trade} • {provider.city}</p>
                        <p className="text-xs text-slate-500 mt-1">Guardado: {new Date(createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant={isCompared ? "default" : "outline"} size="sm" onClick={() => toggleCompare(provider.id)}>
                          <Scale className="h-4 w-4 mr-1" />
                          {isCompared ? "Comparando" : "Comparar"}
                        </Button>
                        <Button variant={isShortlisted ? "default" : "outline"} size="sm" onClick={() => onToggleShortlist(savedId, isShortlisted)}>
                          <Star className={`h-4 w-4 mr-1 ${isShortlisted ? "fill-current" : ""}`} />
                          {isShortlisted ? "En shortlist" : "Shortlist"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/proveedor/${provider.id}`)}>
                          Ver perfil
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onRemove(provider.id)}>
                          Quitar
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={noteValue}
                        onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [savedId]: event.target.value }))}
                        placeholder="Nota personal para comparacion"
                        className="bg-slate-950 border-slate-700 text-slate-100"
                      />
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => onSaveNote(savedId, note)}
                        disabled={isSavingNoteId === savedId}
                      >
                        {isSavingNoteId === savedId ? "Guardando..." : "Guardar nota"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>
    </ConsumerDashboardLayout>
  );
};

export default ConsumerSavedProvidersPage;
