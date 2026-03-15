import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { createServicePost } from "@/hooks/use-marketplace-data";
import { useToast } from "@/hooks/use-toast";

const PublishService = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState("Necesito un profesional");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const isValid = title.trim() && location.trim() && description.trim() && whatsapp.trim();

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createServicePost({
        postType,
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        estimatedBudget: estimatedBudget.trim(),
        whatsapp: whatsapp.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "No se pudo publicar",
        description: "Intenta nuevamente en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pb-16 md:pb-0 flex items-center justify-center px-4">
        <div className="bg-card p-8 rounded-xl obra-shadow text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Solicitud enviada</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tu publicacion sera revisada y aparecera en el marketplace pronto.
          </p>
          <Button variant="accent" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Publicar Servicio</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Publica tu servicio o necesidad de contratacion.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Que necesitas
              </label>
              <select
                value={postType}
                onChange={(event) => setPostType(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Necesito un profesional</option>
                <option>Ofrezco servicios</option>
                <option>Vendo materiales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Titulo
              </label>
              <input
                type="text"
                placeholder="Ej: Necesito un contratista para casa en Santiago"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Ubicacion
              </label>
              <input
                type="text"
                placeholder="Ej: Santo Domingo"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Descripcion
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu proyecto o servicio..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Presupuesto estimado (RD$)
              </label>
              <input
                type="text"
                placeholder="Ej: 50,000 - 100,000"
                value={estimatedBudget}
                onChange={(event) => setEstimatedBudget(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent font-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Ej: 809-123-4567"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent font-tabular"
              />
            </div>

            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishService;
