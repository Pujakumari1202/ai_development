import { z } from "zod";

export const contactSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(50),
});

export const crmDataSchema = z.object({
  managers: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(255),
    email: z.string().trim().email(),
    phone: z.string().trim().max(50),
  })),
  customers: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(255),
    manager: z.string().trim().min(1).max(255),
    contacts: z.array(contactSchema),
  })),
  suppliers: z.array(z.object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(255),
    contacts: z.array(contactSchema),
  })),
  tickets: z.array(z.object({
    id: z.string().min(1).max(100),
    customer: z.string().trim().min(1).max(255),
    supplier: z.string().trim().min(1).max(255),
    manager: z.string().trim().min(1).max(255),
    status: z.enum(["OPEN", "WAITING_SUPPLIER", "WAITING_CUSTOMER", "CLOSED"]),
    summary: z.string().trim().min(1),
    updatedAt: z.string().datetime(),
    conversation: z.array(z.object({
      id: z.string().min(1).max(100),
      sender: z.enum(["CUSTOMER", "AGENT", "SUPPLIER", "SYSTEM"]),
      text: z.string().trim().min(1),
      timestamp: z.string().datetime(),
    })),
  })),
});

export const leadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  company: z.string().trim().max(255).nullable().optional(),
  status: z.enum(["New", "Contacted", "Qualified", "Lost", "Converted"]).default("New"),
  leadType: z.enum([
    "Supplier", "Restaurant", "Retail Store", "Office Pantry",
    "Cafe", "Home Business", "Kitchen",
  ]).nullable().optional(),
  source: z.string().trim().max(100).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const whatsappMessageSchema = z.object({
  recipientId: z.string().trim().min(1).max(50),
  text: z.string().trim().min(1).max(4096),
});

export const accountUserSchema = z.object({
  keycloakUserId: z.string().uuid(),
  role: z.string().trim().min(1).max(10),
});

export const customerBranchSchema = z.object({
  branchName: z.string().trim().min(1).max(255),
  isHq: z.boolean().default(false),
  shopName: z.string().trim().max(255).nullable().optional(),
  zoneNumber: z.string().trim().max(50).nullable().optional(),
  streetNumber: z.string().trim().max(50).nullable().optional(),
  buildingNumber: z.string().trim().max(50).nullable().optional(),
  phoneCountryCode: z.string().trim().max(10).nullable().optional(),
  phoneNumber: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export type CRMDataInput = z.infer<typeof crmDataSchema>;
