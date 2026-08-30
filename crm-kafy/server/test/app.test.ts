import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";
import type { CrmRepository } from "../src/crm-repository.js";

const data = {
  managers: [{
    id: "manager-1",
    name: "Nishat",
    email: "nishat@kafy.qa",
    phone: "+97455001001",
  }],
  customers: [{
    id: "customer-1",
    name: "Cafe",
    manager: "Nishat",
    contacts: [{
      id: "contact-1",
      name: "Buyer",
      email: "buyer@example.com",
      phone: "+97455000000",
    }],
  }],
  suppliers: [{
    id: "supplier-1",
    name: "Foods",
    contacts: [{
      id: "contact-2",
      name: "Sales",
      email: "sales@example.com",
      phone: "+97455000001",
    }],
  }],
  tickets: [{
    id: "ticket-1",
    customer: "Cafe",
    supplier: "Foods",
    manager: "Nishat",
    status: "OPEN" as const,
    summary: "Delivery update",
    updatedAt: "2026-08-30T06:00:00.000Z",
    conversation: [{
      id: "message-1",
      sender: "CUSTOMER" as const,
      text: "When will it arrive?",
      timestamp: "2026-08-30T05:00:00.000Z",
    }],
  }],
};

function repositoryMock() {
  return {
    getAll: vi.fn().mockResolvedValue(data),
    replaceAll: vi.fn().mockResolvedValue(data),
  } as unknown as CrmRepository;
}

describe("CRM API", () => {
  it("returns the normalized CRM payload", async () => {
    const response = await request(createApp(repositoryMock())).get("/api/crm");
    expect(response.status).toBe(200);
    expect(response.body.tickets[0].summary).toBe("Delivery update");
  });

  it("validates writes before calling the repository", async () => {
    const repository = repositoryMock();
    const response = await request(createApp(repository))
      .put("/api/crm")
      .send({ managers: [] });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(repository.replaceAll).not.toHaveBeenCalled();
  });

  it("proxies WhatsApp through the server", async () => {
    const send = vi.fn().mockResolvedValue({ ok: true, messageId: "wamid.1" });
    const response = await request(createApp(repositoryMock(), send))
      .post("/api/whatsapp/messages")
      .send({ recipientId: "+974 55 000 000", text: "Hello" });
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledWith("+974 55 000 000", "Hello");
  });

  it("rejects empty WhatsApp messages", async () => {
    const response = await request(createApp(repositoryMock()))
      .post("/api/whatsapp/messages")
      .send({ recipientId: "+97455000000", text: "" });
    expect(response.status).toBe(400);
  });
});
