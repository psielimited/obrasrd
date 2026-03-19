import { useMemo, useState } from "react";
import { ArrowRightLeft, Heart, Scale, Star } from "lucide-react";
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

  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});
  const [isSavingNoteId, setIsSavingNoteId] = useState<number | null>(null);

  const shortlistCount = useMemo(
    () => savedProviders.filter((item) => item.isShortlisted).length,
    [savedProviders],
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

  return (
    <ConsumerDashboardLayout
      title="Proveedores guardados"
      subtitle="Compara tus opciones favoritas antes de decidir"
      actionLabel="Acciones"
      onAction={() => navigate("/dashboard/cliente/comparar")}
    >
      <div className="space-y-6">
        <SectionCard
          title="Comparador"
          description="Usa shortlist y compara proveedores en una vista dedicada."
          right={
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/cliente/comparar")}>
              <ArrowRightLeft className="h-4 w-4 mr-1" />
              Abrir comparador
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Proveedores guardados: <span className="text-foreground font-semibold">{savedProviders.length}</span> • Shortlist:{" "}
            <span className="text-foreground font-semibold">{shortlistCount}</span>
          </p>
        </SectionCard>

        {isLoading ? (
          <SectionCard title="Cargando" description="Obteniendo tus proveedores guardados...">
            <p className="text-sm text-muted-foreground">Cargando...</p>
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

                return (
                  <div key={provider.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{provider.name}</p>
                          {isShortlisted && <Badge variant="outline" className="border-amber-500/40 text-amber-300">Shortlist</Badge>}
                          {provider.verified && <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">Verificado</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{provider.trade} • {provider.city}</p>
                        <p className="text-xs text-muted-foreground mt-1">Guardado: {new Date(createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/cliente/comparar")}>
                          <Scale className="h-4 w-4 mr-1" />
                          Comparar
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
                        className="bg-background border-border text-foreground"
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

