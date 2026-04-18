import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SearchFilterState } from "@/lib/search/search-filter-state";

interface FilterOption {
  value: string;
  label: string;
}

interface MarketplaceFiltersProps {
  state: SearchFilterState;
  categoryOptions: FilterOption[];
  stageOptions: FilterOption[];
  disciplineOptions: FilterOption[];
  serviceOptions: FilterOption[];
  workTypeOptions: FilterOption[];
  locationOptions: FilterOption[];
  providerTypeOptions: FilterOption[];
  sortOptions: FilterOption[];
  activeFilterCount: number;
  isTaxonomyLoading: boolean;
  hasTaxonomyError: boolean;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onProviderTypeChange: (value: string) => void;
  onStageChange: (value: string) => void;
  onDisciplineChange: (value: string) => void;
  onServiceChange: (value: string) => void;
  onWorkTypeChange: (value: string) => void;
  onVerifiedOnlyChange: (checked: boolean) => void;
  onIdentityOnlyChange: (checked: boolean) => void;
  onPortfolioOnlyChange: (checked: boolean) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

const ALL = "__all__";

const mapToSelectValue = (value: string) => value || ALL;
const mapFromSelectValue = (value: string) => (value === ALL ? "" : value);

const FilterFields = ({
  state,
  categoryOptions,
  stageOptions,
  disciplineOptions,
  serviceOptions,
  workTypeOptions,
  locationOptions,
  providerTypeOptions,
  sortOptions,
  isTaxonomyLoading,
  hasTaxonomyError,
  onCategoryChange,
  onLocationChange,
  onProviderTypeChange,
  onStageChange,
  onDisciplineChange,
  onServiceChange,
  onWorkTypeChange,
  onVerifiedOnlyChange,
  onIdentityOnlyChange,
  onPortfolioOnlyChange,
  onSortChange,
  onClearFilters,
}: Omit<MarketplaceFiltersProps, "activeFilterCount">) => (
  <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Categoria legacy</Label>
        <Select value={mapToSelectValue(state.categoria)} onValueChange={(value) => onCategoryChange(mapFromSelectValue(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {categoryOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Ubicacion</Label>
        <Select value={mapToSelectValue(state.ubicacion)} onValueChange={(value) => onLocationChange(mapFromSelectValue(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {locationOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Tipo de proveedor</Label>
        <Select value={mapToSelectValue(state.tipoProveedor)} onValueChange={(value) => onProviderTypeChange(mapFromSelectValue(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {providerTypeOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Etapa</Label>
        <Select value={mapToSelectValue(state.etapa)} onValueChange={(value) => onStageChange(mapFromSelectValue(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {stageOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Disciplina</Label>
        <Select
          value={mapToSelectValue(state.disciplina)}
          onValueChange={(value) => onDisciplineChange(mapFromSelectValue(value))}
          disabled={isTaxonomyLoading || hasTaxonomyError}
        >
          <SelectTrigger>
            <SelectValue placeholder={isTaxonomyLoading ? "Cargando..." : "Todas"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas</SelectItem>
            {disciplineOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Servicio</Label>
        <Select
          value={mapToSelectValue(state.servicio)}
          onValueChange={(value) => onServiceChange(mapFromSelectValue(value))}
          disabled={isTaxonomyLoading || hasTaxonomyError}
        >
          <SelectTrigger>
            <SelectValue placeholder={isTaxonomyLoading ? "Cargando..." : "Todos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {serviceOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Tipo de obra</Label>
        <Select
          value={mapToSelectValue(state.tipoObra)}
          onValueChange={(value) => onWorkTypeChange(mapFromSelectValue(value))}
          disabled={isTaxonomyLoading || hasTaxonomyError}
        >
          <SelectTrigger>
            <SelectValue placeholder={isTaxonomyLoading ? "Cargando..." : "Todos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {workTypeOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Ordenar por</Label>
        <Select value={state.sort} onValueChange={onSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Relevancia" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
        <span className="text-sm text-foreground">Solo verificados</span>
        <Switch checked={state.soloVerificados} onCheckedChange={onVerifiedOnlyChange} />
      </label>
      <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
        <span className="text-sm text-foreground">Identidad validada</span>
        <Switch checked={state.soloIdentidadVerificada} onCheckedChange={onIdentityOnlyChange} />
      </label>
      <label className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
        <span className="text-sm text-foreground">Portafolio validado</span>
        <Switch checked={state.soloPortafolioValidado} onCheckedChange={onPortfolioOnlyChange} />
      </label>
    </div>

    {hasTaxonomyError && (
      <p className="text-xs text-amber-700">
        No se pudo cargar el catalogo de taxonomia. Puedes seguir usando filtros legacy.
      </p>
    )}

    <div className="flex items-center justify-end">
      <Button variant="ghost" size="sm" onClick={onClearFilters}>
        Limpiar filtros
      </Button>
    </div>
  </div>
);

const MarketplaceFilters = (props: MarketplaceFiltersProps) => {
  return (
    <>
      <div className="hidden rounded-xl border border-border bg-card p-4 obra-shadow md:block">
        <FilterFields {...props} />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 obra-shadow md:hidden">
        <div>
          <p className="text-sm font-semibold text-foreground">Filtros</p>
          <p className="text-xs text-muted-foreground">
            {props.activeFilterCount > 0
              ? `${props.activeFilterCount} filtro(s) activo(s)`
              : "Sin filtros activos"}
          </p>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4" />
              Abrir
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-6">
            <SheetHeader>
              <SheetTitle>Filtrar resultados</SheetTitle>
              <SheetDescription>
                Ajusta etapa, disciplina, servicio y tipo de obra.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-5">
              <FilterFields {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MarketplaceFilters;
