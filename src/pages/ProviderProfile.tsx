import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, Calendar } from "lucide-react";
import { useProvider } from "@/hooks/use-marketplace-data";

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: provider, isLoading } = useProvider(id);

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

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar sus servicios de ${provider.trade}. Vi su perfil en ObrasRD.`
  )}`;

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="px-4 py-6">
        <div className="container max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <div className="bg-card p-6 rounded-xl obra-shadow mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{provider.name}</h1>
                  {provider.verified && <CheckCircle className="h-4 w-4 text-accent" />}
                </div>
                <p className="text-sm text-muted-foreground">{provider.trade}</p>
              </div>
              {provider.startingPrice && (
                <span className="bg-muted text-foreground px-3 py-1.5 rounded-lg text-sm font-bold font-tabular">
                  Desde RD${provider.startingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {provider.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent" />
                {provider.rating} ({provider.reviewCount} reseñas)
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {provider.completedProjects} proyectos
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {provider.yearsExperience} años exp.
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed mb-4">{provider.description}</p>

            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Áreas de servicio
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.serviceAreas.map((area) => (
                  <span key={area} className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="whatsapp" size="lg" className="flex-1" onClick={() => window.open(whatsappUrl, "_blank")}>
                Contactar por WhatsApp
              </Button>
              <Button variant="accent" size="lg" className="flex-1">
                Solicitar cotización
              </Button>
            </div>
          </div>

          {/* Reviews placeholder */}
          <div className="bg-card p-6 rounded-xl obra-shadow">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Reseñas ({provider.reviewCount})
            </h2>
            <div className="space-y-4">
              {[
                { name: "Juan R.", rating: 5, text: "Excelente trabajo, muy profesional y puntual." },
                { name: "Ana M.", rating: 4, text: "Buen servicio, lo recomiendo para proyectos residenciales." },
              ].map((review, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 text-accent fill-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
