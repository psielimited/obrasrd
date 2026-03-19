import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePhases } from "@/hooks/use-marketplace-data";
import { useMyProfile, useMyProviderProfile, profileQueryKeys } from "@/hooks/use-profile-data";
import { useMyProviderPlanSnapshot } from "@/hooks/use-provider-plan-data";
import { upsertMyProviderProfile } from "@/lib/profile-api";
import { ArrowDown, ArrowUp, ImagePlus, Trash2, UserRoundCog } from "lucide-react";

const ProviderProfileEditorPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: phases = [] } = usePhases();
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const { data: planSnapshot } = useMyProviderPlanSnapshot();

  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");
  const [phaseId, setPhaseId] = useState<number>(0);
  const [categorySlug, setCategorySlug] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [serviceAreasRaw, setServiceAreasRaw] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [portfolioImageUrl, setPortfolioImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPhase = phases.find((phase) => phase.id === phaseId);
  const availableCategories = useMemo(() => selectedPhase?.categories ?? [], [selectedPhase]);

  useEffect(() => {
    if (!providerProfile) return;

    setName(providerProfile.name);
    setTrade(providerProfile.trade);
    setPhaseId(providerProfile.phaseId);
    setCategorySlug(providerProfile.categorySlug);
    setLocation(providerProfile.location);
    setCity(providerProfile.city);
    setYearsExperience(providerProfile.yearsExperience);
    setDescription(providerProfile.description);
    setWhatsapp(providerProfile.whatsapp);
    setStartingPrice(providerProfile.startingPrice ? String(providerProfile.startingPrice) : "");
    setServiceAreasRaw(providerProfile.serviceAreas.join(", "));
    setPortfolioImages(providerProfile.portfolioImages);
    setIsFeatured(Boolean(providerProfile.isFeatured));
  }, [providerProfile]);

  useEffect(() => {
    if (!phaseId && phases.length > 0) {
      setPhaseId(phases[0].id);
      setCategorySlug(phases[0].categories[0]?.slug ?? "");
    }
  }, [phaseId, phases]);

  useEffect(() => {
    if (!availableCategories.find((category) => category.slug === categorySlug)) {
      setCategorySlug(availableCategories[0]?.slug ?? "");
    }
  }, [availableCategories, categorySlug]);

  const serviceAreas = useMemo(
    () =>
      serviceAreasRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [serviceAreasRaw],
  );

  const isValid =
    name.trim() &&
    trade.trim() &&
    phaseId > 0 &&
    categorySlug.trim() &&
    location.trim() &&
    city.trim() &&
    description.trim() &&
    whatsapp.trim();

  const addPortfolioImage = () => {
    const url = portfolioImageUrl.trim();
    if (!url || portfolioImages.includes(url)) {
      setPortfolioImageUrl("");
      return;
    }

    setPortfolioImages((prev) => [...prev, url]);
    setPortfolioImageUrl("");
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages((prev) => prev.filter((_, i) => i !== index));
  };

  const movePortfolioImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= portfolioImages.length) return;

    setPortfolioImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const onSave = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      await upsertMyProviderProfile({
        id: providerProfile?.id,
        name: name.trim(),
        trade: trade.trim(),
        phaseId,
        categorySlug,
        location: location.trim(),
        city: city.trim(),
        yearsExperience,
        description: description.trim(),
        whatsapp: whatsapp.trim(),
        startingPrice: startingPrice.trim() ? Number(startingPrice) : undefined,
        serviceAreas,
        portfolioImages,
        isFeatured,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketplace", "providers"] }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.myProviderProfile }),
      ]);

      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente.",
      });
    } catch (error) {
      toast({
        title: "No se pudo guardar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (profile?.role !== "provider") {
    return (
      <ProviderDashboardLayout
        title="Mi perfil"
        subtitle="Configura tu ficha publica"
      >
        <EmptyState
          title="Activa tu rol de proveedor"
          description="Necesitas rol Proveedor para editar esta ficha."
          icon={UserRoundCog}
        />
      </ProviderDashboardLayout>
    );
  }

  const canEnableFeatured = (planSnapshot?.featuredSlots ?? 0) > 0;
  const featuredToggleDisabled = !canEnableFeatured && !isFeatured;

  return (
    <ProviderDashboardLayout
      title="Mi perfil"
      subtitle="Edita tu ficha publica para mejorar conversion"
      actionLabel="Guardar cambios"
      onAction={onSave}
      actionDisabled={!isValid || isSaving}
    >
      <div className="space-y-6 pb-20">
        <SectionCard title="Informacion comercial" description="Nombre y oficio principal para aparecer en busquedas">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre comercial</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trade">Oficio</Label>
              <Input id="trade" value={trade} onChange={(event) => setTrade(event.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Especialidad" description="Define fase y categoria donde ofreces servicios">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Fase</Label>
              <Select value={phaseId ? String(phaseId) : ""} onValueChange={(value) => setPhaseId(Number(value))}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={String(phase.id)}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categorySlug} onValueChange={setCategorySlug}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="years">Anos de experiencia</Label>
              <Input
                id="years"
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(event) => setYearsExperience(Number(event.target.value) || 0)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cobertura" description="Ubicacion principal y zonas de trabajo">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Ubicacion</Label>
              <Input id="location" value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="serviceAreas">Areas de servicio</Label>
            <Input
              id="serviceAreas"
              value={serviceAreasRaw}
              onChange={(event) => setServiceAreasRaw(event.target.value)}
              placeholder="Santo Domingo, Santiago, Punta Cana"
            />
          </div>
        </SectionCard>

        <SectionCard title="Precios y contacto" description="Datos para cotizaciones y respuestas rapidas">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio inicial (RD$)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={startingPrice}
                onChange={(event) => setStartingPrice(event.target.value)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Descripcion" description="Explica tu propuesta de valor y tipo de proyectos">
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion del servicio</Label>
            <Textarea
              id="description"
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Trabajos realizados" description="Muestra evidencia visual real de tu trabajo">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">
              En construccion, las imagenes generan mas confianza que una descripcion larga.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sube fotos reales de trabajos, procesos y resultados de obra.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input
                value={portfolioImageUrl}
                onChange={(event) => setPortfolioImageUrl(event.target.value)}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" onClick={addPortfolioImage}>
                <ImagePlus className="h-4 w-4 mr-1.5" />
                Agregar imagen
              </Button>
            </div>

            {portfolioImages.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Aun no has agregado imagenes de portafolio.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {portfolioImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="rounded-lg border border-border bg-card p-2.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-foreground break-all">{imageUrl}</p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => movePortfolioImage(index, index - 1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === portfolioImages.length - 1}
                          onClick={() => movePortfolioImage(index, index + 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removePortfolioImage(index)}>
                          <Trash2 className="h-4 w-4 text-rose-300" />
                        </Button>
                      </div>
                    </div>
                    <img
                      src={imageUrl}
                      alt={`Portafolio ${index + 1}`}
                      className="mt-2 h-28 w-full rounded-md object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Visibilidad premium" description="Configura beneficios segun tu plan actual">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Perfil destacado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {canEnableFeatured
                    ? "Tu plan permite destacar tu perfil en el marketplace."
                    : "Disponible en planes Pro o Elite."}
                </p>
              </div>
              <Switch
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
                disabled={featuredToggleDisabled}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Plan: {planSnapshot?.planName ?? "Gratis"} - Slots destacados: {planSnapshot?.featuredSlots ?? 0}
            </p>
          </div>
        </SectionCard>

        <div className="sticky bottom-4 z-20">
          <div className="bg-background/95 border border-border rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg">
            <p className="text-sm text-muted-foreground">Guarda cambios para actualizar tu perfil publico.</p>
            <Button variant="accent" onClick={onSave} disabled={!isValid || isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
};

export default ProviderProfileEditorPage;

