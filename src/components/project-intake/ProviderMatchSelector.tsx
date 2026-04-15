import type { Provider } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import ProviderCard from "@/components/ProviderCard";

interface ProviderMatchSelectorProps {
  providers: Provider[];
  selectedProviderIds: string[];
  onToggleProvider: (providerId: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ProviderMatchSelector = ({
  providers,
  selectedProviderIds,
  onToggleProvider,
  onBack,
  onSubmit,
  isSubmitting,
}: ProviderMatchSelectorProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecciona los proveedores a los que quieres enviar la solicitud.
      </p>

      {providers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No encontramos proveedores con esos criterios. Puedes volver y ajustar la etapa, disciplina, servicio o ubicacion.
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => {
            const selected = selectedProviderIds.includes(provider.id);

            return (
              <div key={provider.id} className={`rounded-xl border ${selected ? "border-accent" : "border-transparent"}`}>
                <div className="p-2">
                  <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => onToggleProvider(provider.id)}
                  >
                    {selected ? "Seleccionado" : "Seleccionar"}
                  </Button>
                </div>
                <ProviderCard provider={provider} />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          Volver
        </Button>
        <Button className="flex-1" onClick={onSubmit} disabled={isSubmitting || selectedProviderIds.length === 0}>
          {isSubmitting ? "Enviando..." : `Enviar solicitud (${selectedProviderIds.length})`}
        </Button>
      </div>
    </div>
  );
};

export default ProviderMatchSelector;
