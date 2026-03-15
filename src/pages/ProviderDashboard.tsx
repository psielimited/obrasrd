import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePhases } from "@/hooks/use-marketplace-data";
import { useMyProfile, useMyProviderProfile, profileQueryKeys } from "@/hooks/use-profile-data";
import { upsertMyProviderProfile } from "@/lib/profile-api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const ProviderDashboard = () => {
  const { data: phases = [] } = usePhases();
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
  const [isSaving, setIsSaving] = useState(false);

  const selectedPhase = phases.find((phase) => phase.id === phaseId);
  const availableCategories = useMemo(
    () => selectedPhase?.categories ?? [],
    [selectedPhase],
  );

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

  if (profile?.role !== "provider") {
    return (
      <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
        <div className="container max-w-2xl mx-auto bg-card p-6 rounded-xl obra-shadow space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard de proveedor</h1>
          <p className="text-sm text-muted-foreground">
            Para acceder al dashboard, cambia tu rol a Proveedor en tu perfil.
          </p>
          <Link to="/perfil" className="text-sm font-semibold text-accent hover:underline">
            Ir a mi perfil
          </Link>
        </div>
      </div>
    );
  }

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
    if (!isValid) return;

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
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["marketplace", "providers"] }),
        queryClient.invalidateQueries({ queryKey: profileQueryKeys.myProviderProfile }),
      ]);

      toast({
        title: "Perfil guardado",
        description: "Tu perfil de proveedor se actualizo correctamente.",
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

  return (
    <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
      <div className="container max-w-3xl mx-auto bg-card p-6 rounded-xl obra-shadow space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard de proveedor</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra tu ficha publica en ObrasRD.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nombre comercial</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Oficio</label>
            <input value={trade} onChange={(e) => setTrade(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Fase</label>
            <select value={phaseId || ""} onChange={(e) => setPhaseId(Number(e.target.value))} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent">
              {phases.map((phase) => (
                <option key={phase.id} value={phase.id}>{phase.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Categoria</label>
            <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent">
              {availableCategories.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Ubicacion</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Ciudad</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Anos experiencia</label>
            <input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(Number(e.target.value) || 0)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Precio inicial RD$</label>
            <input type="number" min={0} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Areas de servicio (separadas por coma)</label>
          <input value={serviceAreasRaw} onChange={(e) => setServiceAreasRaw(e.target.value)} placeholder="Santo Domingo, Santiago" className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Descripcion</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent resize-none" />
        </div>

        <div className="flex gap-3">
          <Button variant="accent" onClick={onSave} disabled={!isValid || isSaving}>
            {isSaving ? "Guardando..." : "Guardar perfil"}
          </Button>
          <Link to="/dashboard/leads" className="text-sm font-semibold text-accent self-center hover:underline">
            Ver bandeja de leads
          </Link>
          {providerProfile?.id && (
            <Link to={`/proveedor/${providerProfile.id}`} className="text-sm font-semibold text-accent self-center hover:underline">
              Ver perfil publico
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
