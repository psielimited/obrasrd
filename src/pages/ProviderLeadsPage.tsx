import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, MessageSquareWarning } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LEAD_STATUS_LABELS } from "@/components/dashboard/dashboard-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyProfile, useMyProviderProfile } from "@/hooks/use-profile-data";
import { leadQueryKeys, useMyLeads } from "@/hooks/use-leads-data";
import { LeadStatus, RequesterState, updateLead } from "@/lib/leads-api";
import { useToast } from "@/hooks/use-toast";
import { useDashboardRealtimeSync } from "@/hooks/use-dashboard-realtime-sync";

const REQUESTER_STATE_LABELS: Record<RequesterState, string> = {
  active: "Activa",
  cancelled: "Cancelada",
  archived: "Archivada",
};

const REQUESTER_STATE_CLASSES: Record<RequesterState, string> = {
  active: "border-emerald-500/40 text-emerald-300",
  cancelled: "border-rose-500/40 text-rose-300",
  archived: "border-slate-500/40 text-slate-300",
};

const ACTIONABLE_FILTER_STORAGE_KEY = "provider-leads-show-only-actionable";

const ProviderLeadsPage = () => {
  const navigate = useNavigate();
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const { data: leads = [], isLoading } = useMyLeads();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useDashboardRealtimeSync();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [showOnlyActionable, setShowOnlyActionable] = useState<boolean>(() => {
    const stored = localStorage.getItem(ACTIONABLE_FILTER_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  });
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, LeadStatus>>({});
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});

  const summary = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.total += 1;
        acc[lead.status] += 1;
        return acc;
      },
      {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        closed_won: 0,
        closed_lost: 0,
      } as Record<"total" | LeadStatus, number>,
    );
  }, [leads]);

  const actionableCount = useMemo(
    () => leads.filter((lead) => lead.requesterState === "active").length,
    [leads],
  );

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads
      .filter((lead) => {
        const matchesActionable = !showOnlyActionable || lead.requesterState === "active";
        const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
        const searchable = `${lead.requesterName || ""} ${lead.requesterContact || ""} ${lead.message}`.toLowerCase();
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        return matchesActionable && matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        const aRank = a.requesterState === "active" ? 0 : 1;
        const bRank = b.requesterState === "active" ? 0 : 1;
        if (aRank !== bRank) return aRank - bRank;
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [leads, query, showOnlyActionable, statusFilter]);

  useEffect(() => {
    localStorage.setItem(ACTIONABLE_FILTER_STORAGE_KEY, String(showOnlyActionable));
  }, [showOnlyActionable]);

  const onSaveLead = async (leadId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead || isSaving === leadId) return;

    setIsSaving(leadId);
    try {
      await updateLead(leadId, {
        status: draftStatuses[leadId] ?? lead.status,
        providerReply: draftReplies[leadId] ?? lead.providerReply,
      });

      await queryClient.invalidateQueries({ queryKey: leadQueryKeys.myLeads });

      toast({
        title: "Lead actualizado",
        description: "Cambios guardados correctamente.",
      });
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  if (profile?.role !== "provider") {
    return (
      <ProviderDashboardLayout title="Leads" subtitle="Gestion de solicitudes de cotizacion">
        <EmptyState
          title="Rol de proveedor requerido"
          description="Necesitas activar tu perfil como proveedor para gestionar leads."
          icon={MessageSquareWarning}
          action={<Link to="/perfil" className="text-sm font-semibold text-accent hover:underline">Ir a mi cuenta</Link>}
        />
      </ProviderDashboardLayout>
    );
  }

  if (!providerProfile) {
    return (
      <ProviderDashboardLayout title="Leads" subtitle="Gestion de solicitudes de cotizacion">
        <EmptyState
          title="Completa tu perfil primero"
          description="Necesitas publicar tu ficha para comenzar a recibir leads."
          icon={MessageSquareWarning}
          action={<Link to="/dashboard/proveedor/perfil" className="text-sm font-semibold text-accent hover:underline">Editar perfil</Link>}
        />
      </ProviderDashboardLayout>
    );
  }

  return (
    <ProviderDashboardLayout
      title="Leads"
      subtitle="Da seguimiento rapido a nuevas oportunidades"
      actionLabel="Acciones"
      onAction={() => toast({ title: "Tip", description: "Filtra por estado y responde leads nuevos primero." })}
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total" value={String(summary.total)} hint={`Accionables: ${actionableCount}`} icon={MessageSquareWarning} />
          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((status) => (
            <StatCard key={status} title={LEAD_STATUS_LABELS[status]} value={String(summary[status])} icon={MessageSquareWarning} />
          ))}
        </div>

        <SectionCard title="Filtros" description="Busca por nombre, contacto o contenido de solicitud">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar lead..."
              className="bg-slate-950 border-slate-700 text-slate-100"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | LeadStatus)}>
              <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>{LEAD_STATUS_LABELS[status]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 rounded-md border border-slate-800 px-3">
              <Switch checked={showOnlyActionable} onCheckedChange={setShowOnlyActionable} />
              <span className="text-sm text-slate-300">Solo accionables</span>
            </div>
            <div className="text-sm text-slate-400 flex items-center">Mostrando {filteredLeads.length} resultados</div>
          </div>
        </SectionCard>

        <SectionCard title="Bandeja" description="Actualiza estado, agrega nota y contacta por WhatsApp">
          {isLoading ? (
            <p className="text-sm text-slate-400">Cargando leads...</p>
          ) : filteredLeads.length === 0 ? (
            <p className="text-sm text-slate-400">No hay resultados para tu filtro actual.</p>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Mensaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Estado cliente</TableHead>
                      <TableHead>Mensajes</TableHead>
                      <TableHead>Nota interna</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const status = draftStatuses[lead.id] ?? lead.status;
                      const reply = draftReplies[lead.id] ?? lead.providerReply ?? "";
                      const whatsappUrl = lead.requesterContact
                        ? `https://wa.me/${lead.requesterContact.replace(/[^\d]/g, "")}`
                        : null;
                      const unreadForProvider =
                        Boolean(lead.lastMessageAt) &&
                        (!lead.providerLastReadAt ||
                          Date.parse(lead.lastMessageAt) > Date.parse(lead.providerLastReadAt));

                      return (
                        <TableRow key={lead.id} className={`border-slate-800 hover:bg-slate-900/40 ${lead.requesterState !== "active" ? "opacity-70" : ""}`}>
                          <TableCell>
                            <p className="font-semibold text-slate-100">{lead.requesterName || "Solicitante"}</p>
                            <p className="text-xs text-slate-500">{lead.requesterContact || "Sin contacto"}</p>
                            <p className="text-xs text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-slate-300 line-clamp-2">{lead.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{lead.estimatedBudget || "Sin presupuesto"}</p>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <StatusBadge status={lead.status} />
                              <Select value={status} onValueChange={(value) => setDraftStatuses((prev) => ({ ...prev, [lead.id]: value as LeadStatus }))}>
                                <SelectTrigger className="h-8 bg-slate-950 border-slate-700 text-slate-100 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((option) => (
                                  <SelectItem key={option} value={option}>{LEAD_STATUS_LABELS[option]}</SelectItem>
                                ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={REQUESTER_STATE_CLASSES[lead.requesterState]}>
                              {REQUESTER_STATE_LABELS[lead.requesterState]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Button size="sm" variant="outline" onClick={() => navigate(`/lead/${lead.id}/chat`)}>
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                Chat
                              </Button>
                              <p className="text-[11px] text-slate-500 line-clamp-2">{lead.lastMessagePreview || "Sin mensajes"}</p>
                              {unreadForProvider && (
                                <Badge variant="outline" className="border-accent/40 text-accent w-fit">No leido</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={reply}
                              onChange={(event) => setDraftReplies((prev) => ({ ...prev, [lead.id]: event.target.value }))}
                              placeholder="Nota de seguimiento"
                              className="h-8 bg-slate-950 border-slate-700 text-slate-100"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                              <Button size="sm" variant="accent" onClick={() => onSaveLead(lead.id)} disabled={isSaving === lead.id}>
                                {isSaving === lead.id ? "Guardando..." : "Guardar"}
                              </Button>
                              {whatsappUrl && (
                                <Button size="sm" variant="whatsapp" onClick={() => window.open(whatsappUrl, "_blank")}>
                                  WhatsApp
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 lg:hidden">
                {filteredLeads.map((lead) => {
                  const status = draftStatuses[lead.id] ?? lead.status;
                  const reply = draftReplies[lead.id] ?? lead.providerReply ?? "";
                  const whatsappUrl = lead.requesterContact
                    ? `https://wa.me/${lead.requesterContact.replace(/[^\d]/g, "")}`
                    : null;
                  const unreadForProvider =
                    Boolean(lead.lastMessageAt) &&
                    (!lead.providerLastReadAt ||
                      Date.parse(lead.lastMessageAt) > Date.parse(lead.providerLastReadAt));

                  return (
                    <div key={lead.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{lead.requesterName || "Solicitante"}</p>
                          <p className="text-xs text-slate-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={lead.status} />
                          <Badge variant="outline" className={REQUESTER_STATE_CLASSES[lead.requesterState]}>
                            {REQUESTER_STATE_LABELS[lead.requesterState]}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300">{lead.message}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-500 line-clamp-1">{lead.lastMessagePreview || "Sin mensajes"}</p>
                        {unreadForProvider && <Badge variant="outline" className="border-accent/40 text-accent">No leido</Badge>}
                      </div>

                      <Select value={status} onValueChange={(value) => setDraftStatuses((prev) => ({ ...prev, [lead.id]: value as LeadStatus }))}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((option) => (
                            <SelectItem key={option} value={option}>{LEAD_STATUS_LABELS[option]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={reply}
                        onChange={(event) => setDraftReplies((prev) => ({ ...prev, [lead.id]: event.target.value }))}
                        placeholder="Nota de seguimiento"
                        className="bg-slate-950 border-slate-700 text-slate-100"
                      />

                      <div className="flex gap-2">
                        <Button size="sm" variant="accent" onClick={() => onSaveLead(lead.id)} disabled={isSaving === lead.id}>
                          {isSaving === lead.id ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/lead/${lead.id}/chat`)}>
                          Chat
                        </Button>
                        {whatsappUrl && (
                          <Button size="sm" variant="whatsapp" onClick={() => window.open(whatsappUrl, "_blank")}>
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </ProviderDashboardLayout>
  );
};

export default ProviderLeadsPage;
