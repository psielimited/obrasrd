import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const PublishService = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen pb-16 md:pb-0 flex items-center justify-center px-4">
        <div className="bg-card p-8 rounded-xl obra-shadow text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">¡Solicitud enviada!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tu publicación será revisada y aparecerá en el marketplace pronto.
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

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            Publicar Servicio
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Publica tu servicio o necesidad de contratación.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                ¿Qué necesitas?
              </label>
              <select className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent">
                <option>Necesito un profesional</option>
                <option>Ofrezco servicios</option>
                <option>Vendo materiales</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Título
              </label>
              <input
                type="text"
                placeholder="Ej: Necesito un contratista para casa en Santiago"
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Ubicación
              </label>
              <input
                type="text"
                placeholder="Ej: Santo Domingo"
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Descripción
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu proyecto o servicio..."
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
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent font-tabular"
              />
            </div>

            <Button variant="accent" size="lg" className="w-full" onClick={() => setSubmitted(true)}>
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishService;
