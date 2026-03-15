import { CheckCircle, Search, MessageCircle, ClipboardList } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Busca",
    description: "Encuentra profesionales y materiales por fase de construcción.",
  },
  {
    icon: ClipboardList,
    title: "Compara",
    description: "Revisa perfiles, calificaciones y precios.",
  },
  {
    icon: MessageCircle,
    title: "Contacta",
    description: "Comunícate directamente por WhatsApp.",
  },
  {
    icon: CheckCircle,
    title: "Construye",
    description: "Contrata y comienza tu proyecto.",
  },
];

const HowItWorks = () => {
  return (
    <section className="px-4 py-8 md:py-12">
      <div className="container max-w-5xl mx-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted mb-3">
                <step.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
