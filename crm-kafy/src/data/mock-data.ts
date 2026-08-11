import type {
  Contact,
  ConversationMessage,
  CRMData,
  Customer,
  Manager,
  Supplier,
  Ticket,
  TicketStatus,
} from "@/types/crm";
import { minutesAgo } from "@/utils/date";

let idCounter = 0;

function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter.toString().padStart(4, "0")}`;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ".");
}

function buildContacts(
  orgName: string,
  count: number,
  prefix: string,
): Contact[] {
  const roles = ["Purchasing", "Ops", "Finance"];
  return Array.from({ length: count }, (_, index) => {
    const role = roles[index % roles.length];
    return {
      id: createId(prefix),
      name: `${role} · ${orgName.split(" ")[0]}`,
      email: `${slugify(role)}.${slugify(orgName)}@example.com`,
      phone: `+97444${(100000 + index * 17 + orgName.length * 3).toString().slice(0, 6)}`,
    };
  });
}

function buildConversation(
  index: number,
  supplier: string,
  item: string,
  status: TicketStatus,
): ConversationMessage[] {
  const messages: ConversationMessage[] = [
    {
      id: createId("msg"),
      sender: "CUSTOMER",
      text: `Need an update on ${item} for this week.`,
      timestamp: minutesAgo(index * 19 + 40),
    },
    {
      id: createId("msg"),
      sender: "AGENT",
      text: `Checking availability with ${supplier} now.`,
      timestamp: minutesAgo(index * 19 + 30),
    },
  ];

  if (status !== "OPEN") {
    messages.push({
      id: createId("msg"),
      sender: "SUPPLIER",
      text: `${item} can ship within 24 hours if PO is confirmed.`,
      timestamp: minutesAgo(index * 19 + 18),
    });
  }

  if (status === "CLOSED") {
    messages.push({
      id: createId("msg"),
      sender: "SYSTEM",
      text: "Ticket closed after delivery confirmation.",
      timestamp: minutesAgo(index * 19 + 6),
    });
  }

  return messages;
}

export function createSeedData(): CRMData {
  idCounter = 0;

  const managers: Manager[] = [
    {
      id: createId("manager"),
      name: "Nishat",
      email: "nishat@kafy.qa",
      phone: "+97455001001",
    },
    {
      id: createId("manager"),
      name: "Nada",
      email: "nada@kafy.qa",
      phone: "+97455001002",
    },
    {
      id: createId("manager"),
      name: "Ahmed",
      email: "ahmed@kafy.qa",
      phone: "+97455001003",
    },
    {
      id: createId("manager"),
      name: "Yusuf",
      email: "yusuf@kafy.qa",
      phone: "+97455001004",
    },
  ];

  const customerSeeds = [
    "Starbucks",
    "KFC",
    "McDonald's",
    "Hilton",
    "W Hotel",
    "Costa Coffee",
    "Marriott",
    "Pret A Manger",
  ];

  const supplierSeeds = [
    "Al Meera",
    "Lulu Hypermarket",
    "Carrefour",
    "Bidfood",
    "Fresh Farms",
    "Gulf Foods",
  ];

  const itemNames = [
    "arabica beans",
    "frozen chicken",
    "burger buns",
    "hotel breakfast trays",
    "oat milk",
    "pastry cases",
    "produce crates",
    "syrup assortment",
  ];

  const ticketSummaries = [
    "Urgent bean restock for weekend peak",
    "Frozen chicken shortage for KFC stores",
    "Confirm burger bun delivery window",
    "Breakfast tray SKU substitution at Hilton",
    "Oat milk shortage at Costa Coffee",
    "Pastry case damage claim — W Hotel",
    "Produce quality issue from Fresh Farms",
    "Syrup assortment PO follow-up",
    "Late invoice dispute for Bidfood",
    "Banquet supply checklist for Marriott",
    "Weekend catering add-on for Pret",
    "Dairy cooler temperature alert",
    "New SKU onboarding for Starbucks",
    "Partial shipment short on cups",
    "Return of damaged oat cases",
    "Supplier lead-time update from Lulu",
    "Contract renewal reminder — Carrefour",
    "Menu launch sample kit request",
    "Emergency ice cream stock for McDonald's",
    "Gulf Foods cold-chain delay notice",
  ];

  const customers: Customer[] = customerSeeds.map((name, index) => ({
    id: createId("customer"),
    name,
    manager: managers[index % managers.length].name,
    contacts: buildContacts(name, 1 + (index % 3), "customer-contact"),
  }));

  // WhatsApp Cloud API test customer — phone must match a reachable WA recipient.
  const farhan: Customer = {
    id: createId("customer"),
    name: "Farhan",
    manager: managers[0].name,
    contacts: [
      {
        id: createId("customer-contact"),
        name: "Farhan",
        email: "farhan@example.com",
        phone: "+916290363971",
      },
    ],
  };
  customers.unshift(farhan);

  const suppliers: Supplier[] = supplierSeeds.map((name, index) => ({
    id: createId("supplier"),
    name,
    contacts: buildContacts(name, 1 + (index % 2), "supplier-contact"),
  }));

  const statuses: TicketStatus[] = [
    "OPEN",
    "WAITING_SUPPLIER",
    "WAITING_CUSTOMER",
    "CLOSED",
  ];

  const farhanTicket: Ticket = {
    id: createId("ticket"),
    customer: farhan.name,
    supplier: suppliers[0].name,
    manager: managers[0].name,
    status: "OPEN",
    summary: "WhatsApp test — confirm bread order ETA",
    updatedAt: minutesAgo(5),
    conversation: [
      {
        id: createId("msg"),
        sender: "CUSTOMER",
        text: "Hi, can you confirm when the Lusine breads will arrive?",
        timestamp: minutesAgo(12),
      },
      {
        id: createId("msg"),
        sender: "AGENT",
        text: "Thanks Farhan — checking with the supplier and will reply here on WhatsApp.",
        timestamp: minutesAgo(8),
      },
    ],
  };

  const tickets: Ticket[] = [
    farhanTicket,
    ...Array.from({ length: 20 }, (_, index) => {
      const customer = customers[(index + 1) % customers.length];
      const supplier = suppliers[(index + 1) % suppliers.length];
      const manager = managers[index % managers.length];
      const status = statuses[index % statuses.length];
      const item = itemNames[index % itemNames.length];

      return {
        id: createId("ticket"),
        customer: customer.name,
        supplier: supplier.name,
        manager: manager.name,
        status,
        summary: ticketSummaries[index],
        updatedAt: minutesAgo(index * 19 + 12),
        conversation: buildConversation(index, supplier.name, item, status),
      };
    }),
  ];

  return { tickets, customers, suppliers, managers };
}
