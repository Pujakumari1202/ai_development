export type ActiveTab = "tickets" | "customers" | "suppliers" | "managers";

export type EntityKind = ActiveTab;

export type TicketStatus =
  | "OPEN"
  | "WAITING_SUPPLIER"
  | "WAITING_CUSTOMER"
  | "CLOSED";

export type MessageSender = "CUSTOMER" | "AGENT" | "SUPPLIER" | "SYSTEM";

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type ConversationMessage = {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
};

export type Ticket = {
  id: string;
  customer: string;
  supplier: string;
  manager: string;
  status: TicketStatus;
  summary: string;
  updatedAt: string;
  conversation: ConversationMessage[];
};

export type Customer = {
  id: string;
  name: string;
  manager: string;
  contacts: Contact[];
};

export type Supplier = {
  id: string;
  name: string;
  contacts: Contact[];
};

export type Manager = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CRMData = {
  tickets: Ticket[];
  customers: Customer[];
  suppliers: Supplier[];
  managers: Manager[];
};

export type TicketDraft = {
  customer: string;
  supplier: string;
  manager: string;
  status: TicketStatus;
  summary: string;
};

export type CustomerDraft = {
  name: string;
  manager: string;
  contacts: Contact[];
};

export type SupplierDraft = {
  name: string;
  contacts: Contact[];
};

export type ManagerDraft = {
  name: string;
  email: string;
  phone: string;
};

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
} | null;

export type FilterDefinition = {
  key: string;
  label: string;
  options: string[];
};

export type DashboardStats = {
  totalTickets: number;
  openTickets: number;
  waitingSupplier: number;
  closedTickets: number;
  avgResponseMinutes: number | null;
};
