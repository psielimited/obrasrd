import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProofFirstCard from "@/components/marketplace/ProofFirstCard";
import { Material } from "@/data/marketplace";

interface MaterialCardProps {
  material: Material;
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const whatsappUrl = `https://wa.me/${material.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar ${material.name}. Vi el anuncio en ObrasRD.`,
  )}`;

  return (
    <ProofFirstCard
      imageUrl={getMaterialPhoto(material.category)}
      imageAlt={getMaterialPhotoAlt(material.category)}
      title={material.name}
      stageLabel="Sin etapa"
      disciplineLabel="Sin disciplina"
      locationLabel={material.location || "Ubicacion no indicada"}
      providerNameLabel={material.supplier}
      topRightBadge={material.bulkPrice ? <Badge className="bg-accent text-accent-foreground">Volumen</Badge> : undefined}
      trustContent={
        <div className="flex flex-wrap gap-1.5">
          {material.delivery && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              Delivery disponible
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Suplidor sin verificacion
          </Badge>
        </div>
      }
      primaryCta={
        <Button className="flex-1" size="sm" onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}>
          Cotizar
        </Button>
      }
      secondaryCta={
        <Button variant="outline" size="sm" disabled>
          RD${material.price.toLocaleString()}
        </Button>
      }
    />
  );
};

export default MaterialCard;
