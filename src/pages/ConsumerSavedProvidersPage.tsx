import { Heart } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import EmptyState from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ConsumerSavedProvidersPage = () => {
  const navigate = useNavigate();

  return (
    <ConsumerDashboardLayout
      title="Proveedores guardados"
      subtitle="Guarda perfiles para comparar antes de decidir"
      actionLabel="Acciones"
      onAction={() => navigate("/buscar")}
    >
      <EmptyState
        title="Aun no tienes guardados"
        description="En la siguiente iteracion podremos guardar proveedores desde el marketplace para compararlos aqui."
        icon={Heart}
        action={
          <Button variant="accent" onClick={() => navigate("/buscar")}>Explorar marketplace</Button>
        }
      />
    </ConsumerDashboardLayout>
  );
};

export default ConsumerSavedProvidersPage;
