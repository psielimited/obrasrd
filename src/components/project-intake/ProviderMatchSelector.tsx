import { Button } from "@/components/ui/button";
import ProviderCard from "@/components/ProviderCard";
import type { Phase } from "@/data/marketplace";
import type { ProviderMatchResult } from "@/lib/provider-matching";
import type { TaxonomyCatalog } from "@/lib/taxonomy-api";
import { Badge } from "@/components/ui/badge";

interface ProviderMatchSelectorProps {
  matches: ProviderMatchResult[];
  phases?: Phase[];
  taxonomyCatalog?: TaxonomyCatalog | null;
  selectedProviderIds: string[];
  onToggleProvider: (providerId: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ProviderMatchSelector = ({
  matches,
  phases = [],
  taxonomyCatalog,
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

      {matches.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No encontramos proveedores con esos criterios. Puedes volver y ajustar la etapa, disciplina, servicio o ubicacion.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const { provider } = match;
            const selected = selectedProviderIds.includes(provider.id);

            return (
              <div key={provider.id} className={`rounded-xl border ${selected ? "border-accent" : "border-transparent"}`}>
                <div className="flex flex-wrap items-center gap-1 px-2 pt-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    Score: {match.score}
                  </Badge>
                  {match.reasons.map((reason) => (
                    <Badge key={reason} variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {reason}
                    </Badge>
                  ))}
                </div>
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
                <ProviderCard provider={provider} phases={phases} taxonomyCatalog={taxonomyCatalog} />
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
