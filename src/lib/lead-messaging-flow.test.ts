import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLead,
  markMyLeadThreadRead,
  updateMyLeadState,
} from "@/lib/leads-api";
import { getLeadMessages, sendLeadMessage } from "@/lib/lead-messages-api";

const {
  rpcMock,
  authGetUserMock,
  insertMock,
  orderMock,
  eqMock,
  selectMock,
  fromMock,
} = vi.hoisted(() => {
  const rpc = vi.fn();
  const authGetUser = vi.fn();
  const insert = vi.fn();
  const order = vi.fn();
  const eq = vi.fn();
  const select = vi.fn();
  const from = vi.fn((table: string) => {
    if (table === "lead_messages") {
      return { select };
    }

    if (table === "leads") {
      return { insert };
    }

    return {};
  });

  return {
    rpcMock: rpc,
    authGetUserMock: authGetUser,
    insertMock: insert,
    orderMock: order,
    eqMock: eq,
    selectMock: select,
    fromMock: from,
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: rpcMock,
    from: fromMock,
    auth: {
      getUser: authGetUserMock,
    },
  },
}));

describe("lead messaging flow APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authGetUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    rpcMock.mockResolvedValue({ error: null });
    insertMock.mockResolvedValue({ error: null });

    orderMock.mockResolvedValue({
      data: [
        {
          id: "msg-1",
          lead_id: "lead-1",
          sender_user_id: "user-1",
          sender_role: "requester",
          message: "Hola proveedor",
          created_at: "2026-03-15T12:00:00.000Z",
        },
      ],
      error: null,
    });

    eqMock.mockReturnValue({ order: orderMock });
    selectMock.mockReturnValue({ eq: eqMock });
  });

  it("sends a lead message through RPC", async () => {
    await sendLeadMessage("lead-123", "Necesito cotizacion");

    expect(rpcMock).toHaveBeenCalledWith("send_lead_message", {
      p_lead_id: "lead-123",
      p_message: "Necesito cotizacion",
    });
  });

  it("marks lead thread as read through RPC", async () => {
    await markMyLeadThreadRead("lead-123");

    expect(rpcMock).toHaveBeenCalledWith("mark_my_lead_thread_read", {
      p_lead_id: "lead-123",
    });
  });

  it("updates requester lead state through RPC", async () => {
    await updateMyLeadState("lead-123", "archived");

    expect(rpcMock).toHaveBeenCalledWith("update_my_lead_state", {
      p_lead_id: "lead-123",
      p_requester_state: "archived",
    });
  });

  it("maps lead message rows into app shape", async () => {
    const result = await getLeadMessages("lead-1");

    expect(fromMock).toHaveBeenCalledWith("lead_messages");
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(eqMock).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(result).toEqual([
      {
        id: "msg-1",
        leadId: "lead-1",
        senderUserId: "user-1",
        senderRole: "requester",
        message: "Hola proveedor",
        createdAt: "2026-03-15T12:00:00.000Z",
      },
    ]);
  });

  it("builds a sanitized lead payload before insert", async () => {
    await createLead({
      providerId: "provider-1",
      requesterName: "  Ana Perez  ",
      requesterContact: "  8095551111 ",
      message: "  Quiero cotizar  ",
      estimatedBudget: "   ",
    });

    expect(fromMock).toHaveBeenCalledWith("leads");
    expect(insertMock).toHaveBeenCalledWith({
      provider_id: "provider-1",
      requester_name: "Ana Perez",
      requester_contact: "8095551111",
      requester_user_id: "user-1",
      requester_state: "active",
      message: "Quiero cotizar",
      estimated_budget: null,
      status: "new",
    });
  });

  it("throws when RPC returns error", async () => {
    const failure = new Error("db failed");
    rpcMock.mockResolvedValueOnce({ error: failure });

    await expect(sendLeadMessage("lead-1", "hola")).rejects.toThrow("db failed");
  });
});
