import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  marketplaceQueryKeys,
  moderateServicePost,
  usePendingServicePosts,
  type ServicePostModerationRecord,
  type ServicePostStatus,
} from "@/hooks/use-marketplace-data";
import { useMyProfile } from "@/hooks/use-profile-data";
import { useToast } from "@/hooks/use-toast";

type ModerationFilter = "pending" | "approved" | "rejected" | "all";

interface PostEditState {
  title: string;
  location: string;
  description: string;
  estimatedBudget: string;
  whatsapp: string;
  postType: string;
  reviewNote: string;
  isSubmitting: boolean;
}

const toEditState = (post: ServicePostModerationRecord): PostEditState => ({
  title: post.title,
  location: post.location,
  description: post.description,
  estimatedBudget: post.estimatedBudget ?? "",
  whatsapp: post.whatsapp,
  postType: post.postType,
  reviewNote: post.reviewNote ?? "",
  isSubmitting: false,
});

const statusBadgeVariant = (status: ServicePostStatus): "default" | "secondary" | "destructive" => {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
};

const statusLabel = (status: ServicePostStatus) => {
  if (status === "approved") return "Aprobada";
  if (status === "rejected") return "Rechazada";
  return "Pendiente";
};

const AdminServicePostsModerationPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const [filter, setFilter] = useState<ModerationFilter>("pending");
  const [drafts, setDrafts] = useState<Record<string, PostEditState>>({});

  const { data: posts = [], isLoading, isError, error, refetch, isFetching } = usePendingServicePosts(
    filter,
    profile?.role === "admin",
  );

  const visiblePosts = useMemo(() => posts, [posts]);

  const getDraft = (post: ServicePostModerationRecord): PostEditState => {
    const existing = drafts[post.id];
    if (existing) return existing;
    return toEditState(post);
  };

  const patchDraft = (post: ServicePostModerationRecord, patch: Partial<PostEditState>) => {
    setDrafts((prev) => ({
      ...prev,
      [post.id]: {
        ...(prev[post.id] ?? toEditState(post)),
        ...patch,
      },
    }));
  };

  const refreshAfterModeration = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.pendingServicePosts("all") }),
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.pendingServicePosts("pending") }),
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.pendingServicePosts("approved") }),
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.pendingServicePosts("rejected") }),
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.myServicePosts }),
    ]);
  };

  const onModerate = async (post: ServicePostModerationRecord, status: "approved" | "rejected") => {
    const draft = getDraft(post);
    patchDraft(post, { isSubmitting: true });
    try {
      await moderateServicePost({
        id: post.id,
        status,
        title: draft.title.trim(),
        location: draft.location.trim(),
        description: draft.description.trim(),
        estimatedBudget: draft.estimatedBudget,
        whatsapp: draft.whatsapp.trim(),
        postType: draft.postType.trim(),
        reviewNote: draft.reviewNote,
      });
      toast({
        title: status === "approved" ? "Publicacion aprobada" : "Publicacion rechazada",
        description: "El estado se guardo correctamente.",
      });
      await refreshAfterModeration();
      await refetch();
    } catch (submitError) {
      toast({
        title: "No se pudo actualizar",
        description: submitError instanceof Error ? submitError.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      patchDraft(post, { isSubmitting: false });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando acceso admin...</p>
      </div>
    );
  }

  if ((profile?.role as string) !== "admin") {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-foreground">Acceso restringido</p>
          <p className="mt-1 text-sm text-muted-foreground">Este panel requiere rol admin.</p>
          <Button asChild variant="ghost" className="mt-3">
            <Link to="/dashboard">Ir al dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-1">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Revision de publicaciones</h1>
            <p className="text-xs text-muted-foreground">Administra solicitudes de /empresas y decide aprobacion.</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as ModerationFilter)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="all">Todas</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              {isFetching ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </div>

        {isError && (
          <Card className="p-4 border-destructive/40">
            <p className="text-sm font-semibold text-destructive">No se pudo cargar la cola</p>
            <p className="text-xs text-muted-foreground mt-1">{error instanceof Error ? error.message : "Intenta nuevamente."}</p>
          </Card>
        )}

        {isLoading && !isError && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Cargando publicaciones...</p>
          </Card>
        )}

        {!isLoading && !isError && visiblePosts.length === 0 && (
          <Card className="p-4">
            <p className="text-sm text-foreground">No hay publicaciones para este filtro.</p>
          </Card>
        )}

        {!isLoading && !isError && visiblePosts.map((post) => {
          const draft = getDraft(post);
          return (
            <Card key={post.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">ID: {post.id}</p>
                  <p className="text-xs text-muted-foreground">Owner: {post.ownerUserId || "Sin owner"}</p>
                  <p className="text-xs text-muted-foreground">Creada: {new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant={statusBadgeVariant(post.status)}>{statusLabel(post.status)}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Titulo</label>
                  <input
                    value={draft.title}
                    onChange={(event) => patchDraft(post, { title: event.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ubicacion</label>
                  <input
                    value={draft.location}
                    onChange={(event) => patchDraft(post, { location: event.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tipo</label>
                  <input
                    value={draft.postType}
                    onChange={(event) => patchDraft(post, { postType: event.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">WhatsApp</label>
                  <input
                    value={draft.whatsapp}
                    onChange={(event) => patchDraft(post, { whatsapp: event.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Descripcion</label>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(event) => patchDraft(post, { description: event.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Presupuesto</label>
                  <input
                    value={draft.estimatedBudget}
                    onChange={(event) => patchDraft(post, { estimatedBudget: event.target.value })}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Nota de revision</label>
                  <textarea
                    rows={2}
                    value={draft.reviewNote}
                    onChange={(event) => patchDraft(post, { reviewNote: event.target.value })}
                    placeholder="Motivo de rechazo o contexto de aprobacion"
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="accent"
                  size="sm"
                  disabled={draft.isSubmitting}
                  onClick={() => void onModerate(post, "approved")}
                >
                  {draft.isSubmitting ? "Guardando..." : "Aprobar"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={draft.isSubmitting}
                  onClick={() => void onModerate(post, "rejected")}
                >
                  {draft.isSubmitting ? "Guardando..." : "Rechazar"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminServicePostsModerationPage;
