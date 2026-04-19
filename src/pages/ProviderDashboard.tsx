import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  Eye,
  FilePlus2,
  ListChecks,
  MessageSquare,
  UserRoundCog,
} from "lucide-react";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/dashboard/SectionCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useMyProfile, useMyProviderProfile } from "@/hooks/use-profile-data";
import { useMyLeads } from "@/hooks/use-leads-data";
import { useMyNotifications, useUnreadNotificationCount } from "@/hooks/use-notifications-data";
import { usePhases } from "@/hooks/use-marketplace-data";
import { useDashboardRealtimeSync } from "@/hooks/use-dashboard-realtime-sync";
import { useMyProviderPlanSnapshot } from "@/hooks/use-provider-plan-data";
import {
  calculateProviderProfileCompleteness,
  getProviderProfileQualitySnapshot,
  getProviderTrustBadges,
  isProviderActive,
} from "@/lib/provider-trust";
import CategoryTag from "@/components/marketplace/CategoryTag";
import TrustBadgeRow from "@/components/marketplace/TrustBadgeRow";
import MarketplaceVisualFrame from "@/components/marketplace/MarketplaceVisualFrame";
import { useMemo } from "react";
import { PUBLIC_ROUTES, getProviderHref } from "@/lib/public-ia";

const PLAN_STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  trialing: "Prueba",
  past_due: "Pago pendiente",
  cancelled: "Cancelado",
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const { data: leads = [] } = useMyLeads();
  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: phases = [] } = usePhases();
  const { data: planSnapshot } = useMyProviderPlanSnapshot();
  useDashboardRealtimeSync({ includeRequests: false, includeThread: false });

  const profileCompleteness = calculateProviderProfileCompleteness(providerProfile);
  const qualitySnapshot = getProviderProfileQualitySnapshot(providerProfile);
  const leadsNewOrPending = leads.filter((lead) => lead.status === "new" || lead.status === "contacted").length;
  const unreadLeadThreads = leads.filter(
    (lead) =>
      Boolean(lead.lastMessageAt) &&
      (!lead.providerLastReadAt || Date.parse(lead.lastMessageAt) > Date.parse(lead.providerLastReadAt)),
  ).length;
  const profilePublished = Boolean(providerProfile) && profileCompleteness >= 70;
  const recentLeads = [...leads]
    .sort((a, b) => {
      const aActivityAt = a.lastMessageAt || a.createdAt;
      const bActivityAt = b.lastMessageAt || b.createdAt;
      return Date.parse(bActivityAt) - Date.parse(aActivityAt);
    })
    .slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);
  const portfolioImageCount = providerProfile?.portfolioImages.length ?? 0;
  const hasRecentLeadActivity = leads.some((lead) => {
    const activityAt = lead.lastMessageAt || lead.createdAt;
    return Date.now() - Date.parse(activityAt) <= 1000 * 60 * 60 * 24 * 14;
  });
  const hasRecentNotificationActivity = notifications.some(
    (notification) => Date.now() - Date.parse(notification.createdAt) <= 1000 * 60 * 60 * 24 * 14,
  );
  const providerActive = isProviderActive(providerProfile, {
    profileCompleteness,
    hasRecentLeadActivity,
    hasRecentNotificationActivity,
  });
  const trustBadges = getProviderTrustBadges(providerProfile, {
    profileCompleteness,
    hasRecentLeadActivity,
    hasRecentNotificationActivity,
  });

  const currentPhase = phases.find((phase) => phase.id === providerProfile?.phaseId);
  const currentCategory = currentPhase?.categories.find((category) => category.slug === providerProfile?.categorySlug);

  const warnings = qualitySnapshot.recommendations;

  const greetingName = profile?.displayName || providerProfile?.name || "proveedor";
  const planProgress =
    planSnapshot && !planSnapshot.isQuotaUnlimited && planSnapshot.monthlyLeadQuota
      ? Math.min(
          100,
          Math.round((planSnapshot.leadsUsedThisMonth / planSnapshot.monthlyLeadQuota) * 100),
        )
      : 0;
  const trustChecklist = useMemo(
    () => [
      ...qualitySnapshot.items.map((item) => ({ label: item.label, done: item.done })),
      { label: "Actividad reciente en plataforma", done: providerActive },
    ],
    [providerActive, qualitySnapshot.items],
  );

  if (profile?.role !== "provider") {
    return (
      <ProviderDashboardLayout
        title="Resumen"
        subtitle="Panel de control para proveedores"
      >
        <EmptyState
          title="Activa tu perfil de proveedor"
          description="Para usar este panel, cambia tu rol a Proveedor desde tu cuenta."
          icon={UserRoundCog}
          action={
            <Button variant="accent" onClick={() => navigate("/perfil")}>
              Ir a mi cuenta
            </Button>
          }
        />
      </ProviderDashboardLayout>
    );
  }

  return (
    <ProviderDashboardLayout
      title="Resumen"
      subtitle="Controla tus leads, perfil y actividad del marketplace"
      actionLabel="Acciones"
      onAction={() => navigate("/dashboard/proveedor/perfil")}
    >
      <div className="space-y-6">
        <SectionCard
          title={`Hola, ${greetingName}`}
          description="Este es tu centro de control para administrar oportunidades y mantener tu perfil competitivo."
        >
          <div className="grid gap-3 md:grid-cols-4">
            <StatCard title="Leads totales" value={String(leads.length)} hint="Solicitudes recibidas" icon={ClipboardList} />
            <StatCard
              title="Leads nuevos / pendientes"
              value={String(leadsNewOrPending)}
              hint={`Chats no leidos: ${unreadLeadThreads}`}
              icon={ListChecks}
            />
            <StatCard title="Notificaciones sin leer" value={String(unreadCount)} hint="Actualizaciones recientes" icon={Bell} />
            <StatCard
              title="Perfil"
              value={profilePublished ? "Publicado" : `${profileCompleteness}%`}
              hint={profilePublished ? "Listo para captar leads" : "Completa campos clave"}
              icon={Eye}
            />
          </div>
          <div className="mt-4">
            <TrustBadgeRow badges={trustBadges} />
          </div>
        </SectionCard>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard to="/dashboard/proveedor/perfil" title="Editar perfil" description="Actualiza tu ficha profesional" icon={<UserRoundCog className="h-5 w-5" />} />
          <QuickActionCard to="/dashboard/leads" title="Ver leads" description="Da seguimiento a solicitudes" icon={<ClipboardList className="h-5 w-5" />} />
          <QuickActionCard to={providerProfile?.id ? getProviderHref(providerProfile) : PUBLIC_ROUTES.directorio} title="Ver perfil publico" description="Revisa como te ven clientes" icon={<Eye className="h-5 w-5" />} />
          <QuickActionCard to={PUBLIC_ROUTES.empresas} title="Publicar servicio" description="Crea una nueva oferta" icon={<FilePlus2 className="h-5 w-5" />} />
        </div>

        <SectionCard title="Confianza visual" description="Tu evidencia visual y consistencia de actividad elevan conversiones">
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Imagenes de portafolio</p>
                <p className="mt-1 text-lg font-bold text-foreground">{portfolioImageCount}</p>
                <p className="text-xs text-muted-foreground">
                  {portfolioImageCount === 0
                    ? "Sube fotos reales de tus trabajos"
                    : portfolioImageCount < 3
                      ? "Recomendado: al menos 3 imagenes"
                      : "Buen nivel de evidencia visual"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Revision del perfil</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{providerProfile?.verified ? "Perfil revisado" : "Revision pendiente"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado de actividad</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{providerActive ? "Proveedor activo" : "Actividad por mejorar"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Completitud</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{qualitySnapshot.score}%</p>
                <p className="text-xs text-muted-foreground">
                  {qualitySnapshot.completedWeight}/{qualitySnapshot.totalWeight} puntos
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-semibold text-foreground mb-3">Checklist de confianza</p>
              <div className="space-y-2">
                {trustChecklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${item.done ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Como te ve el cliente</p>
              <MarketplaceVisualFrame
                categorySlug={providerProfile?.categorySlug}
                categoryLabel={currentCategory?.name}
                badgeRow={<Badge variant="outline" className="border-border text-foreground">Vista previa</Badge>}
              >
                {providerProfile?.portfolioImages[0] ? (
                  <img
                    src={providerProfile.portfolioImages[0]}
                    alt="Vista previa del portafolio"
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-40 grid place-items-center text-xs text-muted-foreground">
                    Agrega tu primera imagen para destacar tu trabajo.
                  </div>
                )}
              </MarketplaceVisualFrame>
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="text-sm font-semibold text-foreground">{providerProfile?.name || "Tu nombre comercial"}</p>
                <p className="text-xs text-muted-foreground">{providerProfile?.trade || "Tu especialidad"}</p>
                <CategoryTag categorySlug={providerProfile?.categorySlug} categoryName={currentCategory?.name} />
                <TrustBadgeRow badges={trustBadges} />
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Estado del perfil"
            description="Tu nivel de completitud influye en conversion y confianza"
            className="xl:col-span-2"
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground">Completitud del perfil</span>
                  <span className="font-semibold text-foreground">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-2 bg-muted" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Fase / categoria</p>
                  <p className="text-sm text-foreground mt-1">{currentPhase?.name || "Sin fase"}</p>
                  <p className="text-xs text-muted-foreground">{currentCategory?.name || "Sin categoria"}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Cobertura</p>
                  <p className="text-sm text-foreground mt-1">{providerProfile?.city || "Sin ciudad"}</p>
                  <p className="text-xs text-muted-foreground">{providerProfile?.serviceAreas.length || 0} areas de servicio</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Experiencia</p>
                  <p className="text-sm text-foreground mt-1">{providerProfile?.yearsExperience || 0} anos</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">WhatsApp</p>
                  <p className="text-sm text-foreground mt-1">{providerProfile?.whatsapp || "Sin registrar"}</p>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="rounded-xl border border-amber-700/50 bg-amber-100/90 dark:border-amber-500/40 dark:bg-amber-500/15 p-3 space-y-2">
                  {warnings.map((warning) => (
                    <div key={warning} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100">
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Insights marketplace" description="Sugerencias practicas para mejorar visibilidad">
            <div className="space-y-3 text-sm">
              <p className="text-foreground">
                Fase activa: <span className="text-foreground font-semibold">{currentPhase?.name || "No definida"}</span>
              </p>
              <p className="text-foreground">
                Categoria: <span className="text-foreground font-semibold">{currentCategory?.name || "No definida"}</span>
              </p>
              <p className="text-foreground">
                Zonas: <span className="text-foreground font-semibold">{providerProfile?.serviceAreas.join(", ") || "No definidas"}</span>
              </p>
              <ul className="text-muted-foreground space-y-1.5 pt-2 border-t border-border">
                <li>- Responde leads nuevos en menos de 1 hora para mejorar cierre.</li>
                <li>- Mantener WhatsApp actualizado aumenta contactos directos.</li>
                <li>- Un perfil con descripcion clara mejora la confianza del cliente.</li>
              </ul>
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Tu plan"
          description="Controla limites y beneficios de tu cuenta de proveedor"
          right={<Badge variant="outline" className="border-border text-foreground">{planSnapshot?.planName || "Gratis"}</Badge>}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado</p>
              <p className="text-sm text-foreground mt-1">{PLAN_STATUS_LABELS[planSnapshot?.status || "active"] || "Activo"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Leads este mes</p>
              <p className="text-sm text-foreground mt-1">
                {planSnapshot?.leadsUsedThisMonth ?? 0}
                {planSnapshot?.isQuotaUnlimited ? " (sin limite)" : ` / ${planSnapshot?.monthlyLeadQuota ?? 25}`}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Leads restantes</p>
              <p className="text-sm text-foreground mt-1">
                {planSnapshot?.isQuotaUnlimited ? "Ilimitado" : planSnapshot?.leadsRemainingThisMonth ?? 25}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 md:col-span-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Slots destacados</p>
              <p className="text-sm text-foreground mt-1">
                {planSnapshot?.featuredSlots ?? 0} disponibles en tu plan actual
              </p>
            </div>
          </div>

          {!planSnapshot?.isQuotaUnlimited && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Uso de cuota mensual</span>
                <span>{planProgress}%</span>
              </div>
              <Progress value={planProgress} className="h-2 bg-muted" />
            </div>
          )}

          <div className="mt-4 rounded-xl border border-border bg-card p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-foreground">
              {planSnapshot?.isQuotaUnlimited
                ? "Tu plan actual permite leads ilimitados."
                : "Sube a Pro para ampliar cuota mensual y mejorar visibilidad."}
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/perfil")}>
              Mejorar plan
            </Button>
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Leads recientes"
            description="Ultimas solicitudes de cotizacion"
            right={
              <div className="flex items-center gap-2">
                {unreadLeadThreads > 0 && (
                  <Badge variant="outline" className="border-accent/40 text-accent">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {unreadLeadThreads} no leidos
                  </Badge>
                )}
                <Link to="/dashboard/leads" className="text-xs font-semibold text-accent hover:underline">
                  Ver todos
                </Link>
              </div>
            }
          >
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes leads todavia.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-foreground">{lead.requesterName || "Solicitante"}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        {Boolean(lead.lastMessageAt) &&
                          (!lead.providerLastReadAt ||
                            Date.parse(lead.lastMessageAt) > Date.parse(lead.providerLastReadAt)) && (
                            <Badge variant="outline" className="border-accent/40 text-accent">
                              No leido
                            </Badge>
                          )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.estimatedBudget ? `Presupuesto: ${lead.estimatedBudget}` : "Sin presupuesto"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(lead.lastMessageAt || lead.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Notificaciones recientes"
            description="Actividad reciente de tu cuenta"
            right={
              <Link to="/notificaciones" className="text-xs font-semibold text-accent hover:underline">
                Ver todas
              </Link>
            }
          >
            {recentNotifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tienes notificaciones.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-xl border p-3 ${notification.readAt ? "border-border bg-card" : "border-accent/30 bg-accent/10"}`}
                  >
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
};

export default ProviderDashboard;

