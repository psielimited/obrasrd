import { CheckCircle, Search, MessageCircle, ClipboardList } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Busca",
    description: "Encuentra profesionales y materiales por fase de construccion.",
  },
  {
    icon: ClipboardList,
    title: "Compara",
    description: "Revisa perfiles, calificaciones y precios.",
  },
  {
    icon: MessageCircle,
    title: "Contacta",
    description: "Comunicate directamente por WhatsApp.",
  },
  {
    icon: CheckCircle,
    title: "Construye",
    description: "Contrata y comienza tu proyecto.",
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="px-4 py-8 md:py-12">
      <div className="container mx-auto max-w-5xl">
        <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Como funciona
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="text-center md:text-left">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <step.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground">{step.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
