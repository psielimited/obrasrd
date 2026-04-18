import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePhases } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { useMyProfile, useMyProviderProfile, profileQueryKeys } from "@/hooks/use-profile-data";
import { useMyProviderPlanSnapshot } from "@/hooks/use-provider-plan-data";
import { upsertMyProviderProfile } from "@/lib/profile-api";
import { deleteProviderPortfolioImageByUrl, linkMyProviderProfileMedia, uploadImageAsset } from "@/lib/media-api";
import { getProviderProfileQualitySnapshot } from "@/lib/provider-trust";
import type { Provider } from "@/data/marketplace";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, Upload, UserRoundCog } from "lucide-react";

const ProviderProfileEditorPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: phases = [] } = usePhases();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [primaryDisciplineId, setPrimaryDisciplineId] = useState<number | undefined>(undefined);
  const [primaryServiceId, setPrimaryServiceId] = useState<number | undefined>(undefined);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedWorkTypeIds, setSelectedWorkTypeIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedPhase = phases.find((phase) => phase.id === phaseId);
  const availableCategories = useMemo(() => selectedPhase?.categories ?? [], [selectedPhase]);
  const allDisciplines = taxonomyCatalog?.disciplines ?? [];
  const allServices = taxonomyCatalog?.services ?? [];
  const allWorkTypes = taxonomyCatalog?.workTypes ?? [];
  const disciplinesForPhase = useMemo(() => {
    const filtered = allDisciplines.filter((item) => item.stageId === phaseId);
    return filtered.length > 0 ? filtered : allDisciplines;
  }, [allDisciplines, phaseId]);
  const servicesForDiscipline = useMemo(() => {
    if (!primaryDisciplineId) return allServices;
    return allServices.filter((item) => item.disciplineId === primaryDisciplineId);
  }, [allServices, primaryDisciplineId]);

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
    setPrimaryDisciplineId(providerProfile.primaryDisciplineId);
    setPrimaryServiceId(providerProfile.primaryServiceId);
    setSelectedServiceIds(providerProfile.serviceIds ?? []);
    setSelectedWorkTypeIds(providerProfile.workTypeIds ?? []);
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

  useEffect(() => {
    if (primaryServiceId == null) return;
    const service = allServices.find((item) => item.id === primaryServiceId);
    if (service && primaryDisciplineId !== service.disciplineId) {
      setPrimaryDisciplineId(service.disciplineId);
    }
  }, [allServices, primaryDisciplineId, primaryServiceId]);

  useEffect(() => {
    if (primaryServiceId == null) return;
    setSelectedServiceIds((prev) => (prev.includes(primaryServiceId) ? prev : [...prev, primaryServiceId]));
  }, [primaryServiceId]);

  const serviceAreas = useMemo(
    () =>
      serviceAreasRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [serviceAreasRaw],
  );

  const draftProviderForQuality: Provider = useMemo(
    () => ({
      id: providerProfile?.id ?? "draft",
      name,
      trade,
      categorySlug,
      phaseId,
      primaryDisciplineId,
      primaryServiceId,
      serviceIds: selectedServiceIds,
      workTypeIds: selectedWorkTypeIds,
      location,
      city,
      yearsExperience,
      description,
      rating: providerProfile?.rating ?? 0,
      reviewCount: providerProfile?.reviewCount ?? 0,
      completedProjects: providerProfile?.completedProjects ?? 0,
      verified: providerProfile?.verified ?? false,
      isFeatured,
      whatsapp,
      startingPrice: startingPrice.trim() ? Number(startingPrice) : undefined,
      portfolioImages,
      serviceAreas,
      trustSnapshot: providerProfile?.trustSnapshot,
      portfolioProjects: providerProfile?.portfolioProjects ?? [],
    }),
    [
      categorySlug,
      city,
      description,
      isFeatured,
      location,
      name,
      phaseId,
      portfolioImages,
      primaryDisciplineId,
      primaryServiceId,
      providerProfile?.completedProjects,
      providerProfile?.id,
      providerProfile?.portfolioProjects,
      providerProfile?.rating,
      providerProfile?.reviewCount,
      providerProfile?.trustSnapshot,
      providerProfile?.verified,
      selectedServiceIds,
      selectedWorkTypeIds,
      serviceAreas,
      startingPrice,
      trade,
      whatsapp,
      yearsExperience,
    ],
  );

  const qualitySnapshot = useMemo(
    () => getProviderProfileQualitySnapshot(draftProviderForQuality),
    [draftProviderForQuality],
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

  const removePortfolioImage = async (index: number) => {
    const imageUrl = portfolioImages[index];
    if (!imageUrl) return;

    try {
      await deleteProviderPortfolioImageByUrl(imageUrl);
    } catch (error) {
      toast({
        title: "No se pudo eliminar la imagen",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

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

  const onUploadPortfolioImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isUploadingImage) return;

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadImageAsset({
        file,
        entityType: "provider_profile",
        entityId: providerProfile?.id,
      });

      if (!uploaded.publicUrl) {
        throw new Error("No se pudo generar la URL publica del archivo.");
      }

      setPortfolioImages((prev) =>
        prev.includes(uploaded.publicUrl as string)
          ? prev
          : [...prev, uploaded.publicUrl as string],
      );

      toast({
        title: "Imagen subida",
        description: "La imagen se agrego a tu portafolio.",
      });
    } catch (error) {
      toast({
        title: "No se pudo subir la imagen",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSave = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      const providerId = await upsertMyProviderProfile({
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
        primaryDisciplineId,
        primaryServiceId,
        serviceIds: selectedServiceIds,
        workTypeIds: selectedWorkTypeIds,
      });
      await linkMyProviderProfileMedia(providerId);

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
        <SectionCard title="Completitud del perfil" description="Mejora confianza y visibilidad con estos senales">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-foreground">Puntaje actual</span>
                <span className="font-semibold text-foreground">
                  {qualitySnapshot.score}% ({qualitySnapshot.completedWeight}/{qualitySnapshot.totalWeight})
                </span>
              </div>
              <Progress value={qualitySnapshot.score} className="h-2 bg-muted" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {qualitySnapshot.items.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card p-2.5">
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.done ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                    <div>
                      <p className={`text-sm font-medium ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </p>
                      {!item.done ? <p className="text-xs text-muted-foreground">{item.helpText}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Disciplina tecnica principal</Label>
              <Select
                value={primaryDisciplineId ? String(primaryDisciplineId) : ""}
                onValueChange={(value) => {
                  const next = value ? Number(value) : undefined;
                  setPrimaryDisciplineId(next);
                  setPrimaryServiceId(undefined);
                }}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinesForPhase.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Servicio principal</Label>
              <Select
                value={primaryServiceId ? String(primaryServiceId) : ""}
                onValueChange={(value) => setPrimaryServiceId(value ? Number(value) : undefined)}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona servicio principal" />
                </SelectTrigger>
                <SelectContent>
                  {servicesForDiscipline.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Servicios que ofreces</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {servicesForDiscipline.map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedServiceIds.includes(item.id)}
                    onChange={(event) =>
                      setSelectedServiceIds((prev) =>
                        event.target.checked ? [...new Set([...prev, item.id])] : prev.filter((id) => id !== item.id),
                      )
                    }
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>Tipos de trabajo</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {allWorkTypes.map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedWorkTypeIds.includes(item.id)}
                    onChange={(event) =>
                      setSelectedWorkTypeIds((prev) =>
                        event.target.checked ? [...new Set([...prev, item.id])] : prev.filter((id) => id !== item.id),
                      )
                    }
                  />
                  <span>{item.name}</span>
                </label>
              ))}
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onUploadPortfolioImage}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingImage ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1.5" />
                )}
                Subir desde dispositivo
              </Button>
              <Input
                value={portfolioImageUrl}
                onChange={(event) => setPortfolioImageUrl(event.target.value)}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" onClick={addPortfolioImage} disabled={isUploadingImage}>
                <ImagePlus className="h-4 w-4 mr-1.5" />
                Agregar URL
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
                        <Button type="button" variant="ghost" size="icon" onClick={() => void removePortfolioImage(index)}>
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
            <p className="text-sm text-muted-foreground">
              Perfil {qualitySnapshot.score}% completo. Guarda cambios para actualizar tu perfil publico.
            </p>
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



