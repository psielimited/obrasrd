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

const calculateProfileCompleteness = (provider: ReturnType<typeof useMyProviderProfile>["data"]) => {
  if (!provider) return 0;

  const checks = [
    Boolean(provider.name.trim()),
    Boolean(provider.trade.trim()),
    provider.phaseId > 0,
    Boolean(provider.categorySlug.trim()),
    Boolean(provider.city.trim()),
    Boolean(provider.location.trim()),
    provider.yearsExperience > 0,
    Boolean(provider.whatsapp.trim()),
    Boolean(provider.description.trim()),
    provider.serviceAreas.length > 0,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const { data: leads = [] } = useMyLeads();
  const { data: notifications = [] } = useMyNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: phases = [] } = usePhases();
  useDashboardRealtimeSync({ includeRequests: false, includeThread: false });

  const profileCompleteness = calculateProfileCompleteness(providerProfile);
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

  const currentPhase = phases.find((phase) => phase.id === providerProfile?.phaseId);
  const currentCategory = currentPhase?.categories.find((category) => category.slug === providerProfile?.categorySlug);

  const warnings: string[] = [];
  if (!providerProfile?.description?.trim()) warnings.push("Completa tu descripcion para mejorar confianza.");
  if (!providerProfile?.whatsapp?.trim()) warnings.push("Agrega tu WhatsApp para recibir respuestas mas rapido.");
  if (!providerProfile?.serviceAreas?.length) warnings.push("Define al menos una area de servicio.");

  const greetingName = profile?.displayName || providerProfile?.name || "proveedor";

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
        </SectionCard>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard to="/dashboard/proveedor/perfil" title="Editar perfil" description="Actualiza tu ficha profesional" icon={<UserRoundCog className="h-5 w-5" />} />
          <QuickActionCard to="/dashboard/leads" title="Ver leads" description="Da seguimiento a solicitudes" icon={<ClipboardList className="h-5 w-5" />} />
          <QuickActionCard to={providerProfile?.id ? `/proveedor/${providerProfile.id}` : "/buscar"} title="Ver perfil publico" description="Revisa como te ven clientes" icon={<Eye className="h-5 w-5" />} />
          <QuickActionCard to="/publicar" title="Publicar servicio" description="Crea una nueva oferta" icon={<FilePlus2 className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard
            title="Estado del perfil"
            description="Tu nivel de completitud influye en conversion y confianza"
            className="xl:col-span-2"
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-300">Completitud del perfil</span>
                  <span className="font-semibold text-slate-100">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-2 bg-slate-800" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Fase / categoria</p>
                  <p className="text-sm text-slate-100 mt-1">{currentPhase?.name || "Sin fase"}</p>
                  <p className="text-xs text-slate-400">{currentCategory?.name || "Sin categoria"}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Cobertura</p>
                  <p className="text-sm text-slate-100 mt-1">{providerProfile?.city || "Sin ciudad"}</p>
                  <p className="text-xs text-slate-400">{providerProfile?.serviceAreas.length || 0} areas de servicio</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Experiencia</p>
                  <p className="text-sm text-slate-100 mt-1">{providerProfile?.yearsExperience || 0} anos</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">WhatsApp</p>
                  <p className="text-sm text-slate-100 mt-1">{providerProfile?.whatsapp || "Sin registrar"}</p>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                  {warnings.map((warning) => (
                    <div key={warning} className="flex items-start gap-2 text-sm text-amber-200">
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
              <p className="text-slate-300">
                Fase activa: <span className="text-slate-100 font-semibold">{currentPhase?.name || "No definida"}</span>
              </p>
              <p className="text-slate-300">
                Categoria: <span className="text-slate-100 font-semibold">{currentCategory?.name || "No definida"}</span>
              </p>
              <p className="text-slate-300">
                Zonas: <span className="text-slate-100 font-semibold">{providerProfile?.serviceAreas.join(", ") || "No definidas"}</span>
              </p>
              <ul className="text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li>- Responde leads nuevos en menos de 1 hora para mejorar cierre.</li>
                <li>- Mantener WhatsApp actualizado aumenta contactos directos.</li>
                <li>- Un perfil con descripcion clara mejora la confianza del cliente.</li>
              </ul>
            </div>
          </SectionCard>
        </div>

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
              <p className="text-sm text-slate-400">No tienes leads todavia.</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-slate-100">{lead.requesterName || "Solicitante"}</p>
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
                    <p className="text-xs text-slate-400">{lead.estimatedBudget ? `Presupuesto: ${lead.estimatedBudget}` : "Sin presupuesto"}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(lead.lastMessageAt || lead.createdAt).toLocaleString()}</p>
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
              <p className="text-sm text-slate-400">No tienes notificaciones.</p>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-xl border p-3 ${notification.readAt ? "border-slate-800 bg-slate-950/40" : "border-accent/30 bg-accent/10"}`}
                  >
                    <p className="text-sm font-semibold text-slate-100">{notification.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{notification.body}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
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
