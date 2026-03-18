import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Calendar, Heart, MapPin, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CategoryTag from "@/components/marketplace/CategoryTag";
import TrustBadgeRow from "@/components/marketplace/TrustBadgeRow";
import { useProvider, usePhases } from "@/hooks/use-marketplace-data";
import { createLead } from "@/lib/leads-api";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/hooks/use-profile-data";
import { toggleSavedProvider } from "@/lib/saved-providers-api";
import { savedProvidersQueryKeys, useMySavedProviderIds } from "@/hooks/use-saved-providers-data";
import {
  calculateProviderProfileCompleteness,
  getProviderTrustBadges,
  isProviderActive,
} from "@/lib/provider-trust";
import { getCategoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars: ("full" | "half" | "empty")[] = [];

  for (let i = 0; i < 5; i += 1) {
    if (i < full) stars.push("full");
    else if (i === full && hasHalf) stars.push("half");
    else stars.push("empty");
  }

  return (
    <span className="inline-flex gap-px">
      {stars.map((state, index) => (
        <Star
          key={index}
          className={cn(
            "h-3.5 w-3.5",
            state === "full" && "fill-accent text-accent",
            state === "half" && "fill-accent/40 text-accent",
            state === "empty" && "text-muted-foreground/35",
          )}
        />
      ))}
    </span>
  );
};

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: provider, isLoading } = useProvider(id);
  const { data: phases = [] } = usePhases();
  const { user } = useAuthSession();
  const { data: profile } = useMyProfile();
  const { data: savedProviderIds = [] } = useMySavedProviderIds();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [requesterName, setRequesterName] = useState("");
  const [requesterContact, setRequesterContact] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  useEffect(() => {
    if (!profile && !user) return;
    if (!requesterName.trim()) {
      setRequesterName(profile?.displayName || user?.email?.split("@")[0] || "");
    }
  }, [profile, user, requesterName]);

  const categoryName = useMemo(() => {
    const phase = phases.find((item) => item.id === provider?.phaseId);
    return phase?.categories.find((item) => item.slug === provider?.categorySlug)?.name;
  }, [phases, provider?.categorySlug, provider?.phaseId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando proveedor...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Proveedor no encontrado.</p>
      </div>
    );
  }

  const theme = getCategoryTheme(provider.categorySlug);
  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar sus servicios de ${provider.trade}. Vi su perfil en ObrasRD.`,
  )}`;
  const canSubmitLead = requesterContact.trim() && message.trim();
  const isSaved = savedProviderIds.includes(provider.id);
  const completeness = calculateProviderProfileCompleteness(provider);
  const trustBadges = getProviderTrustBadges(provider, {
    profileCompleteness: completeness,
  });
  const active = isProviderActive(provider, { profileCompleteness: completeness });
  const images = provider.portfolioImages ?? [];
  const heroImage = images[0] ?? "";
  const galleryImages = images.slice(0, 4);

  const submitLead = async () => {
    if (!canSubmitLead || isSubmittingLead) return;

    setIsSubmittingLead(true);
    try {
      await createLead({
        providerId: provider.id,
        requesterName: requesterName.trim() || undefined,
        requesterContact: requesterContact.trim(),
        estimatedBudget: estimatedBudget.trim() || undefined,
        message: message.trim(),
      });

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cotizacion fue enviada al proveedor.",
      });

      setShowQuoteForm(false);
      setEstimatedBudget("");
      setMessage("");
    } catch (error) {
      toast({
        title: "No se pudo enviar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const onToggleSave = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/proveedor/${provider.id}` } });
      return;
    }

    try {
      const saved = await toggleSavedProvider(provider.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.ids }),
        queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.list }),
      ]);

      toast({
        title: saved ? "Proveedor guardado" : "Proveedor removido",
        description: saved ? "Lo agregamos a tus guardados." : "Se elimino de tus guardados.",
      });
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const onShare = async () => {
    const shareUrl = `${window.location.origin}/proveedor/${provider.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${provider.name} | ObrasRD`,
          text: `Mira el perfil de ${provider.name} en ObrasRD`,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Enlace copiado",
        description: "Comparte este perfil con tu equipo.",
      });
    } catch {
      toast({
        title: "No se pudo compartir",
        description: "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE7] pb-28 text-[#1A1612]">
      <section className="relative h-[340px] overflow-hidden bg-[#1A1612] md:h-[430px]">
        {heroImage ? (
          <img
            src={heroImage}
            alt={`Trabajo de ${provider.name}`}
            className="h-full w-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-slate-300">
            Este proveedor aun no ha subido portada visual.
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/90" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 md:px-5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-full border-white/35 bg-black/35 px-3 text-white backdrop-blur hover:bg-black/55"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-white/35 bg-black/35 text-white backdrop-blur hover:bg-black/55"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute inset-x-0 top-16 flex items-center justify-between px-4 md:px-5">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em]",
              theme.pillClassName,
            )}
          >
            {categoryName || theme.label}
          </span>
          {active && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-whatsapp" />
              Activo
            </span>
          )}
        </div>

        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-[82px] flex items-center justify-center gap-1.5 md:bottom-[92px]">
            {Array.from({ length: Math.min(images.length, 5) }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-[5px] rounded-full transition-all",
                  index === 0 ? "w-4 bg-white" : "w-[5px] bg-white/45",
                )}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 px-4 pb-5 md:px-5 md:pb-6">
          <h1 className="max-w-[16ch] text-[31px] font-extrabold leading-[1.02] tracking-tight text-white md:max-w-none md:text-4xl">
            {provider.name}
          </h1>
          <p className="mt-1 text-sm italic text-white/70">{provider.trade}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-px bg-[#2A221A] text-white sm:grid-cols-4">
        <div className="bg-[#1A1612] px-3 py-4 text-center md:py-5">
          <p className="text-xl font-extrabold leading-none">
            {provider.yearsExperience}
            <span className="ml-1 text-xs text-accent">anos</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/55">Experiencia</p>
        </div>
        <div className="bg-[#1A1612] px-3 py-4 text-center md:py-5">
          <p className="text-xl font-extrabold leading-none">{provider.completedProjects}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/55">Proyectos</p>
        </div>
        <div className="bg-[#1A1612] px-3 py-4 text-center md:py-5">
          <p className="text-xl font-extrabold leading-none">
            {provider.rating}
            <span className="ml-1 text-xs text-accent">★</span>
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/55">{provider.reviewCount} resenas</p>
        </div>
        <div className="bg-[#1A1612] px-3 py-4 text-center md:py-5">
          <p className="text-xl font-extrabold leading-none">{provider.serviceAreas.length}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/55">Zonas</p>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-4 md:py-5">
        <section className="rounded-2xl border border-[#E3DDD4] bg-white p-5 shadow-[0_1px_2px_rgba(26,22,18,0.05)]">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#7A6E64]">Desde</p>
              <p className="text-[31px] font-extrabold leading-none tracking-tight text-[#1A1612]">
                {provider.startingPrice ? `RD$${provider.startingPrice.toLocaleString()}` : "A cotizar"}
              </p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm text-[#7A6E64]">
              <MapPin className="h-4 w-4" />
              {provider.city}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TrustBadgeRow badges={trustBadges} />
            <span className="ml-auto inline-flex items-center gap-2 rounded-md border border-[#E3DDD4] bg-[#F5F0E8] px-2.5 py-1">
              <span className="text-sm font-bold text-[#1A1612]">{provider.rating}</span>
              <StarRating rating={provider.rating} />
              <span className="text-xs text-[#7A6E64]">({provider.reviewCount})</span>
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E3DDD4] bg-white p-5 shadow-[0_1px_2px_rgba(26,22,18,0.05)]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A6E64]">Descripcion</p>
          <p className="text-sm leading-relaxed text-[#3D342B]">{provider.description}</p>

          <div className="my-4 h-px bg-[#E3DDD4]" />

          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A6E64]">Areas de servicio</p>
          <div className="flex flex-wrap gap-2">
            {provider.serviceAreas.map((area) => (
              <Badge key={area} variant="outline" className="border-[#E3DDD4] bg-[#F5F0E8] font-medium text-[#3D342B]">
                {area}
              </Badge>
            ))}
          </div>

          <div className="mt-4">
            <CategoryTag categorySlug={provider.categorySlug} categoryName={categoryName} />
          </div>
        </section>

        <section className="rounded-2xl border border-[#E3DDD4] bg-white p-5 shadow-[0_1px_2px_rgba(26,22,18,0.05)]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A6E64]">Proyectos</p>
          {galleryImages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E3DDD4] p-6 text-center text-sm text-[#7A6E64]">
              Este proveedor aun no ha publicado imagenes de obra.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {galleryImages.map((imageUrl, index) => (
                <div
                  key={`${imageUrl}-${index}`}
                  className={cn(
                    "overflow-hidden rounded-xl border border-[#E3DDD4] bg-[#F5F0E8]",
                    index === 0 && "col-span-2 aspect-[16/7]",
                    index !== 0 && "aspect-[4/3]",
                  )}
                >
                  <img
                    src={imageUrl}
                    alt={`Trabajo ${index + 1} de ${provider.name}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {showQuoteForm && (
          <section className="rounded-2xl border border-[#E3DDD4] bg-white p-5 shadow-[0_1px_2px_rgba(26,22,18,0.05)]">
            <p className="text-sm font-semibold text-[#1A1612]">Enviar solicitud de cotizacion</p>
            <p className="mt-1 text-xs text-[#7A6E64]">
              Describe alcance, tiempos y tipo de obra para recibir una respuesta mas precisa.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input
                value={requesterName}
                onChange={(event) => setRequesterName(event.target.value)}
                placeholder="Tu nombre"
              />
              <Input
                value={requesterContact}
                onChange={(event) => setRequesterContact(event.target.value)}
                placeholder="Telefono o WhatsApp"
              />
            </div>

            <Input
              value={estimatedBudget}
              onChange={(event) => setEstimatedBudget(event.target.value)}
              placeholder="Presupuesto estimado (opcional)"
              className="mt-3"
            />

            <Textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe brevemente lo que necesitas"
              className="mt-3 resize-none"
            />

            <div className="mt-3 flex gap-2">
              <Button variant="accent" size="sm" onClick={submitLead} disabled={!canSubmitLead || isSubmittingLead}>
                {isSubmittingLead ? "Enviando..." : "Enviar solicitud"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowQuoteForm(false)}>
                Cancelar
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[#E3DDD4] bg-white p-4 shadow-[0_1px_2px_rgba(26,22,18,0.05)]">
          <div className="grid gap-2 text-sm text-[#7A6E64] sm:grid-cols-3">
            <p className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {provider.yearsExperience} anos de experiencia
            </p>
            <p className="inline-flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {provider.completedProjects} proyectos completados
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {provider.location}
            </p>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E3DDD4] bg-white/95 px-4 py-3 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="container mx-auto flex max-w-5xl items-center gap-2">
          <Button
            variant="default"
            className="h-11 flex-1 rounded-xl border border-[#1A1612]/15 bg-[#1A1612] uppercase tracking-[0.12em] text-[11px] text-white hover:bg-[#9E5A24]"
            onClick={() => window.open(whatsappUrl, "_blank")}
          >
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl uppercase tracking-[0.12em] text-[11px]"
            onClick={() => setShowQuoteForm((prev) => !prev)}
          >
            Cotizacion
          </Button>
          <Button
            variant={isSaved ? "default" : "outline"}
            size="icon"
            onClick={onToggleSave}
            className="h-11 w-11 shrink-0 rounded-xl"
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
