import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import { Button } from "@/components/ui/button";
import { useMyServicePosts } from "@/hooks/use-marketplace-data";
import { useMyProfile } from "@/hooks/use-profile-data";
import { useNavigate } from "react-router-dom";

const statusBadgeVariant = (status: "pending" | "approved" | "rejected"): "default" | "secondary" | "destructive" => {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const statusLabel = (status: "pending" | "approved" | "rejected") => {
  if (status === "approved") return "Aprobada";
  if (status === "rejected") return "Rechazada";
  return "Pendiente";
};

const MyServicePostsPage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: posts = [], isLoading: postsLoading, isError, error, refetch, isFetching } = useMyServicePosts(
    Boolean(profile),
  );

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
      </div>
    );
  }

  const content = (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Estado de tus publicaciones</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aqui puedes ver si cada publicacion sigue pendiente, fue aprobada o rechazada por el equipo interno.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </Card>

      {isError && (
        <Card className="p-4 border-destructive/40">
          <p className="text-sm font-semibold text-destructive">No se pudo cargar tu historial</p>
          <p className="text-xs text-muted-foreground mt-1">{error instanceof Error ? error.message : "Intenta nuevamente."}</p>
        </Card>
      )}

      {!isError && !postsLoading && posts.length === 0 && (
        <Card className="p-5">
          <p className="text-sm font-semibold text-foreground">Aun no tienes publicaciones</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Crea tu primera publicacion para entrar al flujo de revision.
          </p>
          <Button variant="accent" size="sm" onClick={() => navigate("/empresas")}>
            Publicar ahora
          </Button>
        </Card>
      )}

      {postsLoading && !isError && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
        </Card>
      )}

      {!isError && !postsLoading && posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{post.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{post.location}</p>
            </div>
            <Badge variant={statusBadgeVariant(post.status)}>{statusLabel(post.status)}</Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-3">{post.description}</p>

          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p>Tipo: <span className="text-foreground">{post.postType}</span></p>
            <p>WhatsApp: <span className="text-foreground">{post.whatsapp}</span></p>
            <p>Creada: <span className="text-foreground">{new Date(post.createdAt).toLocaleString()}</span></p>
            {post.reviewedAt ? (
              <p>Revisada: <span className="text-foreground">{new Date(post.reviewedAt).toLocaleString()}</span></p>
            ) : (
              <p>Revisada: <span className="text-foreground">Pendiente</span></p>
            )}
          </div>

          {post.reviewNote ? (
            <div className="mt-3 rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Nota de revision</p>
              <p className="text-xs text-foreground mt-1">{post.reviewNote}</p>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );

  if (profile?.role === "provider") {
    return (
      <ProviderDashboardLayout
        title="Mis publicaciones"
        subtitle="Seguimiento de revision y aprobacion"
        actionLabel="Publicar"
        onAction={() => navigate("/empresas")}
      >
        {content}
      </ProviderDashboardLayout>
    );
  }

  return (
    <ConsumerDashboardLayout
      title="Mis publicaciones"
      subtitle="Seguimiento de revision y aprobacion"
      actionLabel="Publicar"
      onAction={() => navigate("/empresas")}
    >
      {content}
    </ConsumerDashboardLayout>
  );
};

export default MyServicePostsPage;
