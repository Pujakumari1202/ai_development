import { useCallback, useEffect, useMemo, useState } from "react";

import { sendWhatsAppMessage } from "@/services/whatsapp";
import { loadCrmData, resetCrmData, saveCrmData } from "@/storage/crm-storage";
import type {
  CRMData,
  Customer,
  CustomerDraft,
  DashboardStats,
  Manager,
  ManagerDraft,
  Supplier,
  SupplierDraft,
  Ticket,
  TicketDraft,
} from "@/types/crm";

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function computeStats(tickets: Ticket[]): DashboardStats {
  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const waitingSupplier = tickets.filter(
    (t) => t.status === "WAITING_SUPPLIER",
  ).length;
  const closedTickets = tickets.filter((t) => t.status === "CLOSED").length;

  const responseSamples = tickets
    .map((ticket) => {
      const firstCustomer = ticket.conversation.find(
        (m) => m.sender === "CUSTOMER",
      );
      const firstAgent = ticket.conversation.find((m) => m.sender === "AGENT");
      if (!firstCustomer || !firstAgent) return null;
      const minutes =
        (new Date(firstAgent.timestamp).getTime() -
          new Date(firstCustomer.timestamp).getTime()) /
        60_000;
      return minutes >= 0 ? minutes : null;
    })
    .filter((value): value is number => value !== null);

  const avgResponseMinutes =
    responseSamples.length === 0
      ? null
      : Math.round(
          responseSamples.reduce((sum, n) => sum + n, 0) /
            responseSamples.length,
        );

  return {
    totalTickets: tickets.length,
    openTickets,
    waitingSupplier,
    closedTickets,
    avgResponseMinutes,
  };
}

export function useCrm() {
  const [data, setData] = useState<CRMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (next: CRMData) => {
    await saveCrmData(next);
    setData(next);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await loadCrmData();
        if (!cancelled) {
          setData(loaded);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load CRM");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => (data ? computeStats(data.tickets) : null),
    [data],
  );

  const createTicket = useCallback(
    async (draft: TicketDraft) => {
      if (!data) return;
      const ticket: Ticket = {
        id: createId("ticket"),
        ...draft,
        updatedAt: new Date().toISOString(),
        conversation: [
          {
            id: createId("msg"),
            sender: "SYSTEM",
            text: "Ticket created.",
            timestamp: new Date().toISOString(),
          },
        ],
      };
      await persist({ ...data, tickets: [ticket, ...data.tickets] });
    },
    [data, persist],
  );

  const updateTicket = useCallback(
    async (id: string, draft: TicketDraft) => {
      if (!data) return;
      await persist({
        ...data,
        tickets: data.tickets.map((ticket) =>
          ticket.id === id
            ? { ...ticket, ...draft, updatedAt: new Date().toISOString() }
            : ticket,
        ),
      });
    },
    [data, persist],
  );

  const deleteTicket = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({
        ...data,
        tickets: data.tickets.filter((ticket) => ticket.id !== id),
      });
    },
    [data, persist],
  );

  const addTicketReply = useCallback(
    async (ticketId: string, text: string) => {
      if (!data) return { whatsapp: null as Awaited<
        ReturnType<typeof sendWhatsAppMessage>
      > | null };

      const ticket = data.tickets.find((item) => item.id === ticketId);
      if (!ticket) return { whatsapp: null };

      const message = {
        id: createId("msg"),
        sender: "AGENT" as const,
        text,
        timestamp: new Date().toISOString(),
      };

      const nextTickets = data.tickets.map((item) =>
        item.id === ticketId
          ? {
              ...item,
              conversation: [...item.conversation, message],
              updatedAt: message.timestamp,
            }
          : item,
      );

      await persist({ ...data, tickets: nextTickets });

      const customer = data.customers.find((c) => c.name === ticket.customer);
      const phone = customer?.contacts[0]?.phone;
      if (!phone) {
        return {
          whatsapp: {
            ok: false as const,
            reason: "request_failed" as const,
            message: "No customer phone number on file.",
          },
        };
      }

      const whatsapp = await sendWhatsAppMessage(phone, text);
      return { whatsapp };
    },
    [data, persist],
  );

  const createCustomer = useCallback(
    async (draft: CustomerDraft) => {
      if (!data) return;
      const customer: Customer = { id: createId("customer"), ...draft };
      await persist({ ...data, customers: [customer, ...data.customers] });
    },
    [data, persist],
  );

  const updateCustomer = useCallback(
    async (id: string, draft: CustomerDraft) => {
      if (!data) return;
      await persist({
        ...data,
        customers: data.customers.map((customer) =>
          customer.id === id ? { ...customer, ...draft } : customer,
        ),
      });
    },
    [data, persist],
  );

  const deleteCustomer = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({
        ...data,
        customers: data.customers.filter((customer) => customer.id !== id),
      });
    },
    [data, persist],
  );

  const createSupplier = useCallback(
    async (draft: SupplierDraft) => {
      if (!data) return;
      const supplier: Supplier = { id: createId("supplier"), ...draft };
      await persist({ ...data, suppliers: [supplier, ...data.suppliers] });
    },
    [data, persist],
  );

  const updateSupplier = useCallback(
    async (id: string, draft: SupplierDraft) => {
      if (!data) return;
      await persist({
        ...data,
        suppliers: data.suppliers.map((supplier) =>
          supplier.id === id ? { ...supplier, ...draft } : supplier,
        ),
      });
    },
    [data, persist],
  );

  const deleteSupplier = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({
        ...data,
        suppliers: data.suppliers.filter((supplier) => supplier.id !== id),
      });
    },
    [data, persist],
  );

  const createManager = useCallback(
    async (draft: ManagerDraft) => {
      if (!data) return;
      const manager: Manager = { id: createId("manager"), ...draft };
      await persist({ ...data, managers: [manager, ...data.managers] });
    },
    [data, persist],
  );

  const updateManager = useCallback(
    async (id: string, draft: ManagerDraft) => {
      if (!data) return;
      await persist({
        ...data,
        managers: data.managers.map((manager) =>
          manager.id === id ? { ...manager, ...draft } : manager,
        ),
      });
    },
    [data, persist],
  );

  const deleteManager = useCallback(
    async (id: string) => {
      if (!data) return;
      await persist({
        ...data,
        managers: data.managers.filter((manager) => manager.id !== id),
      });
    },
    [data, persist],
  );

  const reset = useCallback(async () => {
    const seed = await resetCrmData();
    setData(seed);
  }, []);

  return {
    data,
    loading,
    error,
    stats,
    createTicket,
    updateTicket,
    deleteTicket,
    addTicketReply,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createManager,
    updateManager,
    deleteManager,
    reset,
  };
}
