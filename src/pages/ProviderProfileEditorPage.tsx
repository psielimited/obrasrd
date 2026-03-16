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
import { UserRoundCog } from "lucide-react";

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
                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
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
                <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
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

        <SectionCard title="Visibilidad premium" description="Configura beneficios segun tu plan actual">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">Perfil destacado</p>
                <p className="text-xs text-slate-400 mt-1">
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
            <p className="text-xs text-slate-500">
              Plan: {planSnapshot?.planName ?? "Gratis"} • Slots destacados: {planSnapshot?.featuredSlots ?? 0}
            </p>
          </div>
        </SectionCard>

        <div className="sticky bottom-4 z-20">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg">
            <p className="text-sm text-slate-400">Guarda cambios para actualizar tu perfil publico.</p>
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
