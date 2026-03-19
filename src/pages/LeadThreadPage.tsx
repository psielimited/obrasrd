import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import ProviderDashboardLayout from "@/components/dashboard/ProviderDashboardLayout";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyProfile } from "@/hooks/use-profile-data";
import { useLeadMessages, leadMessagesQueryKeys } from "@/hooks/use-lead-messages-data";
import { leadQueryKeys } from "@/hooks/use-leads-data";
import { getLeadById, markMyLeadThreadRead } from "@/lib/leads-api";
import { sendLeadMessage } from "@/lib/lead-messages-api";
import { useToast } from "@/hooks/use-toast";
import { notificationQueryKeys } from "@/hooks/use-notifications-data";
import { useDashboardRealtimeSync } from "@/hooks/use-dashboard-realtime-sync";

const LeadThreadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const { data: messages = [], isLoading } = useLeadMessages(id);

  const [leadName, setLeadName] = useState("Solicitud");
  const [leadStatus, setLeadStatus] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const threadBottomRef = useRef<HTMLDivElement | null>(null);
  useDashboardRealtimeSync({ leadId: id });

  useEffect(() => {
    if (!id) return;

    getLeadById(id)
      .then((lead) => {
        if (!lead) return;
        setLeadName(lead.requesterName || "Solicitud");
        setLeadStatus(lead.status);
      })
      .catch(() => {
        // Silent fail for now; page handles empty state gracefully.
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    markMyLeadThreadRead(id)
      .then(async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: leadQueryKeys.myLeads }),
          queryClient.invalidateQueries({ queryKey: leadQueryKeys.myRequests }),
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list }),
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount }),
        ]);
      })
      .catch(() => {
        // Keep UX resilient if this call fails.
      });
  }, [id, queryClient]);

  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const onSend = async () => {
    if (!id || !draft.trim() || sending) return;

    setSending(true);
    try {
      await sendLeadMessage(id, draft.trim());
      setDraft("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leadMessagesQueryKeys.thread(id) }),
        queryClient.invalidateQueries({ queryKey: leadQueryKeys.myLeads }),
        queryClient.invalidateQueries({ queryKey: leadQueryKeys.myRequests }),
      ]);
    } catch (error) {
      toast({
        title: "No se pudo enviar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const isProvider = profile?.role === "provider";
  const Layout = isProvider ? ProviderDashboardLayout : ConsumerDashboardLayout;

  return (
    <Layout
      title="Mensajes"
      subtitle="Conversacion de la solicitud"
      actionLabel="Acciones"
      onAction={() => {
        if (isProvider) {
          navigate("/dashboard/leads");
          return;
        }
        navigate("/dashboard/cliente/solicitudes");
      }}
    >
      <div className="space-y-6">
        <SectionCard
          title={leadName}
          description={`Estado actual: ${leadStatus || "Sin estado"}`}
          right={
            <Link
              to={isProvider ? "/dashboard/leads" : "/dashboard/cliente/solicitudes"}
              className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver
            </Link>
          }
        >
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <EmptyState
              title="Sin mensajes"
              description="Inicia la conversacion para acelerar la cotizacion."
              icon={Send}
            />
          ) : (
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {messages.map((message) => {
                const mine = isProvider
                  ? message.senderRole === "provider"
                  : message.senderRole === "requester";

                return (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl px-3 py-2 border ${
                      mine
                        ? "ml-auto bg-accent/15 border-accent/40 text-foreground"
                        : "mr-auto bg-card border-border text-foreground"
                    }`}
                  >
                    <p className="text-xs font-semibold opacity-70 mb-1">
                      {message.senderRole === "provider" ? "Proveedor" : "Cliente"}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
              <div ref={threadBottomRef} />
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              placeholder="Escribe un mensaje..."
              className="bg-background border-border text-foreground"
            />
            <div className="flex justify-end">
              <Button variant="accent" onClick={onSend} disabled={!draft.trim() || sending}>
                {sending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>
    </Layout>
  );
};

export default LeadThreadPage;

