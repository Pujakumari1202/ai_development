import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CellText, DataTable, type DataTableColumn } from "@/components/DataTable";
import { Drawer } from "@/components/Drawer";
import { EntityFormModal } from "@/components/EntityFormModal";
import { FilterBar } from "@/components/FilterBar";
import { SearchBar } from "@/components/SearchBar";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { TopTabs } from "@/components/TopTabs";
import { useCrm } from "@/hooks/use-crm";
import type {
  ActiveTab,
  Contact,
  Customer,
  FilterDefinition,
  Manager,
  SortState,
  Supplier,
  Ticket,
  TicketStatus,
} from "@/types/crm";
import { formatRelativeTime } from "@/utils/date";
import { colors, radii, spacing } from "@/utils/crm-theme";

type Entity = Ticket | Customer | Supplier | Manager;

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    sensitivity: "base",
  });
}

function contactSummary(contacts: Contact[]): string {
  if (contacts.length === 0) return "—";
  if (contacts.length === 1) return contacts[0].name;
  return `${contacts[0].name} +${contacts.length - 1}`;
}

export function CrmDashboardScreen() {
  const {
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
  } = useCrm();

  const { width } = useWindowDimensions();
  const compact = width < 900;

  const [tab, setTab] = useState<ActiveTab>("tickets");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState>({
    key: "updatedAt",
    direction: "desc",
  });
  const [drawerEntity, setDrawerEntity] = useState<Entity | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formEntity, setFormEntity] = useState<Entity | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Entity | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  const filterDefs: FilterDefinition[] = useMemo(() => {
    if (!data || tab !== "tickets") return [];
    return [
      {
        key: "status",
        label: "Status",
        options: [
          "OPEN",
          "WAITING_SUPPLIER",
          "WAITING_CUSTOMER",
          "CLOSED",
        ],
      },
      {
        key: "manager",
        label: "Manager",
        options: unique(data.managers.map((m) => m.name)),
      },
      {
        key: "customer",
        label: "Customer",
        options: unique(data.customers.map((c) => c.name)),
      },
      {
        key: "supplier",
        label: "Supplier",
        options: unique(data.suppliers.map((s) => s.name)),
      },
    ];
  }, [data, tab]);

  const ticketRows = useMemo(() => {
    if (!data) return [] as Ticket[];
    const q = search.trim().toLowerCase();
    let rows = data.tickets.filter((ticket) => {
      if (filters.status && filters.status !== "All" && ticket.status !== filters.status) {
        return false;
      }
      if (
        filters.manager &&
        filters.manager !== "All" &&
        ticket.manager !== filters.manager
      ) {
        return false;
      }
      if (
        filters.customer &&
        filters.customer !== "All" &&
        ticket.customer !== filters.customer
      ) {
        return false;
      }
      if (
        filters.supplier &&
        filters.supplier !== "All" &&
        ticket.supplier !== filters.supplier
      ) {
        return false;
      }
      if (!q) return true;
      return [
        ticket.customer,
        ticket.supplier,
        ticket.manager,
        ticket.status,
        ticket.summary,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    if (sort) {
      rows = [...rows].sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        return (
          compareValues(
            a[sort.key as keyof Ticket],
            b[sort.key as keyof Ticket],
          ) * dir
        );
      });
    }
    return rows;
  }, [data, filters, search, sort]);

  const customerRows = useMemo(() => {
    if (!data) return [] as (Customer & {
      openTickets: number;
      closedTickets: number;
      lastActivity: string;
    })[];
    const q = search.trim().toLowerCase();
    let rows = data.customers.map((customer) => {
      const related = data.tickets.filter((t) => t.customer === customer.name);
      const last = [...related].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      )[0];
      return {
        ...customer,
        openTickets: related.filter((t) => t.status !== "CLOSED").length,
        closedTickets: related.filter((t) => t.status === "CLOSED").length,
        lastActivity: last?.updatedAt ?? "",
      };
    });
    if (q) {
      rows = rows.filter((row) =>
        [row.name, row.manager, contactSummary(row.contacts)]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        return compareValues((a as any)[sort.key], (b as any)[sort.key]) * dir;
      });
    }
    return rows;
  }, [data, search, sort]);

  const supplierRows = useMemo(() => {
    if (!data) return [] as (Supplier & {
      openRequests: number;
      completed: number;
      lastResponse: string;
    })[];
    const q = search.trim().toLowerCase();
    let rows = data.suppliers.map((supplier) => {
      const related = data.tickets.filter((t) => t.supplier === supplier.name);
      const last = [...related].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      )[0];
      return {
        ...supplier,
        openRequests: related.filter((t) => t.status !== "CLOSED").length,
        completed: related.filter((t) => t.status === "CLOSED").length,
        lastResponse: last?.updatedAt ?? "",
      };
    });
    if (q) {
      rows = rows.filter((row) =>
        [row.name, contactSummary(row.contacts)]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        return compareValues((a as any)[sort.key], (b as any)[sort.key]) * dir;
      });
    }
    return rows;
  }, [data, search, sort]);

  const managerRows = useMemo(() => {
    if (!data) return [] as (Manager & {
      assignedAccounts: number;
      openTickets: number;
      closedTickets: number;
    })[];
    const q = search.trim().toLowerCase();
    let rows = data.managers.map((manager) => {
      const accounts = data.customers.filter((c) => c.manager === manager.name);
      const related = data.tickets.filter((t) => t.manager === manager.name);
      return {
        ...manager,
        assignedAccounts: accounts.length,
        openTickets: related.filter((t) => t.status !== "CLOSED").length,
        closedTickets: related.filter((t) => t.status === "CLOSED").length,
      };
    });
    if (q) {
      rows = rows.filter((row) =>
        [row.name, row.email, row.phone].join(" ").toLowerCase().includes(q),
      );
    }
    if (sort) {
      rows = [...rows].sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        return compareValues((a as any)[sort.key], (b as any)[sort.key]) * dir;
      });
    }
    return rows;
  }, [data, search, sort]);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleTabChange = (next: ActiveTab) => {
    setTab(next);
    setSearch("");
    setFilters({});
    setDrawerEntity(null);
    setSort(
      next === "tickets"
        ? { key: "updatedAt", direction: "desc" }
        : { key: "name", direction: "asc" },
    );
  };

  const openCreate = () => {
    setFormEntity(null);
    setFormMode("create");
  };

  const openEdit = (entity: Entity) => {
    setFormEntity(entity);
    setFormMode("edit");
  };

  const handleFormSubmit = async (values: Record<string, string>) => {
    if (!data || !formMode) return;

    if (tab === "tickets") {
      const draft = {
        customer: values.customer,
        supplier: values.supplier,
        manager: values.manager,
        status: values.status as TicketStatus,
        summary: values.summary.trim(),
      };
      if (formMode === "create") await createTicket(draft);
      else if (formEntity) await updateTicket(formEntity.id, draft);
    }

    if (tab === "customers") {
      const existing = formEntity as Customer | null;
      const draft = {
        name: values.name.trim(),
        manager: values.manager,
        contacts: [
          {
            id: existing?.contacts[0]?.id ?? `contact-${Date.now()}`,
            name: values.name.trim() || "Primary",
            email: values.email.trim(),
            phone: values.phone.trim(),
          },
        ],
      };
      if (formMode === "create") await createCustomer(draft);
      else if (formEntity) await updateCustomer(formEntity.id, draft);
    }

    if (tab === "suppliers") {
      const existing = formEntity as Supplier | null;
      const draft = {
        name: values.name.trim(),
        contacts: [
          {
            id: existing?.contacts[0]?.id ?? `contact-${Date.now()}`,
            name: values.name.trim() || "Primary",
            email: values.email.trim(),
            phone: values.phone.trim(),
          },
        ],
      };
      if (formMode === "create") await createSupplier(draft);
      else if (formEntity) await updateSupplier(formEntity.id, draft);
    }

    if (tab === "managers") {
      const draft = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      };
      if (formMode === "create") await createManager(draft);
      else if (formEntity) await updateManager(formEntity.id, draft);
    }

    setFormMode(null);
    setFormEntity(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    if (tab === "tickets") await deleteTicket(pendingDelete.id);
    if (tab === "customers") await deleteCustomer(pendingDelete.id);
    if (tab === "suppliers") await deleteSupplier(pendingDelete.id);
    if (tab === "managers") await deleteManager(pendingDelete.id);
    if (drawerEntity?.id === pendingDelete.id) setDrawerEntity(null);
    setPendingDelete(null);
  };

  const handleTicketReply = async (ticketId: string, text: string) => {
    setSendingReply(true);
    try {
      const result = await addTicketReply(ticketId, text);
      if (result.whatsapp && !result.whatsapp.ok) {
        if (result.whatsapp.reason === "request_failed") {
          Alert.alert(
            "WhatsApp send failed",
            `${result.whatsapp.message}\n\nReply was still saved locally.`,
          );
        }
        // missing_credentials: soft-fail silently (console already warned)
      }
    } finally {
      setSendingReply(false);
    }
  };

  const ActionButtons = ({ entity }: { entity: Entity }) => (
    <View style={styles.actions}>
      <Pressable style={styles.actionBtn} onPress={() => setDrawerEntity(entity)}>
        <Text style={styles.actionText}>View</Text>
      </Pressable>
      <Pressable style={styles.actionBtn} onPress={() => openEdit(entity)}>
        <Text style={styles.actionText}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.actionBtn, styles.dangerBtn]}
        onPress={() => setPendingDelete(entity)}
      >
        <Text style={[styles.actionText, styles.dangerText]}>Delete</Text>
      </Pressable>
    </View>
  );

  const ticketColumns: DataTableColumn<Ticket>[] = [
    {
      key: "customer",
      label: "Customer",
      width: 140,
      sortable: true,
      render: (row) => <CellText>{row.customer}</CellText>,
    },
    {
      key: "supplier",
      label: "Supplier",
      width: 150,
      sortable: true,
      render: (row) => <CellText>{row.supplier}</CellText>,
    },
    {
      key: "manager",
      label: "Manager",
      width: 110,
      sortable: true,
      render: (row) => <CellText>{row.manager}</CellText>,
    },
    {
      key: "status",
      label: "Status",
      width: 150,
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "updatedAt",
      label: "Updated",
      width: 110,
      sortable: true,
      render: (row) => (
        <CellText muted>{formatRelativeTime(row.updatedAt)}</CellText>
      ),
    },
    {
      key: "summary",
      label: "Summary",
      width: 260,
      sortable: true,
      render: (row) => <CellText ellipsis>{row.summary}</CellText>,
    },
    {
      key: "actions",
      label: "Actions",
      width: 200,
      render: (row) => <ActionButtons entity={row} />,
    },
  ];

  const customerColumns: DataTableColumn<(typeof customerRows)[number]>[] = [
    {
      key: "name",
      label: "Customer",
      width: 160,
      sortable: true,
      render: (row) => <CellText>{row.name}</CellText>,
    },
    {
      key: "manager",
      label: "Account Manager",
      width: 150,
      sortable: true,
      render: (row) => <CellText>{row.manager}</CellText>,
    },
    {
      key: "contacts",
      label: "Contacts",
      width: 160,
      render: (row) => <CellText>{contactSummary(row.contacts)}</CellText>,
    },
    {
      key: "openTickets",
      label: "Open Tickets",
      width: 120,
      sortable: true,
      render: (row) => <CellText>{String(row.openTickets)}</CellText>,
    },
    {
      key: "closedTickets",
      label: "Closed Tickets",
      width: 130,
      sortable: true,
      render: (row) => <CellText>{String(row.closedTickets)}</CellText>,
    },
    {
      key: "lastActivity",
      label: "Last Activity",
      width: 130,
      sortable: true,
      render: (row) => (
        <CellText muted>
          {row.lastActivity ? formatRelativeTime(row.lastActivity) : "—"}
        </CellText>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 200,
      render: (row) => <ActionButtons entity={row} />,
    },
  ];

  const supplierColumns: DataTableColumn<(typeof supplierRows)[number]>[] = [
    {
      key: "name",
      label: "Supplier",
      width: 180,
      sortable: true,
      render: (row) => <CellText>{row.name}</CellText>,
    },
    {
      key: "contacts",
      label: "Contacts",
      width: 160,
      render: (row) => <CellText>{contactSummary(row.contacts)}</CellText>,
    },
    {
      key: "openRequests",
      label: "Open Requests",
      width: 130,
      sortable: true,
      render: (row) => <CellText>{String(row.openRequests)}</CellText>,
    },
    {
      key: "completed",
      label: "Completed",
      width: 120,
      sortable: true,
      render: (row) => <CellText>{String(row.completed)}</CellText>,
    },
    {
      key: "lastResponse",
      label: "Last Response",
      width: 140,
      sortable: true,
      render: (row) => (
        <CellText muted>
          {row.lastResponse ? formatRelativeTime(row.lastResponse) : "—"}
        </CellText>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: 200,
      render: (row) => <ActionButtons entity={row} />,
    },
  ];

  const managerColumns: DataTableColumn<(typeof managerRows)[number]>[] = [
    {
      key: "name",
      label: "Manager",
      width: 140,
      sortable: true,
      render: (row) => <CellText>{row.name}</CellText>,
    },
    {
      key: "assignedAccounts",
      label: "Assigned Accounts",
      width: 150,
      sortable: true,
      render: (row) => <CellText>{String(row.assignedAccounts)}</CellText>,
    },
    {
      key: "openTickets",
      label: "Open Tickets",
      width: 120,
      sortable: true,
      render: (row) => <CellText>{String(row.openTickets)}</CellText>,
    },
    {
      key: "closedTickets",
      label: "Closed Tickets",
      width: 130,
      sortable: true,
      render: (row) => <CellText>{String(row.closedTickets)}</CellText>,
    },
    {
      key: "email",
      label: "Contact",
      width: 200,
      sortable: true,
      render: (row) => <CellText ellipsis>{row.email}</CellText>,
    },
    {
      key: "actions",
      label: "Actions",
      width: 200,
      render: (row) => <ActionButtons entity={row} />,
    },
  ];

  if (loading || !data || !stats) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading CRM…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.primaryBtn} onPress={reset}>
            <Text style={styles.primaryBtnText}>Reset demo data</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const newLabel =
    tab === "tickets"
      ? "+ New Ticket"
      : tab === "customers"
        ? "+ New Customer"
        : tab === "suppliers"
          ? "+ New Supplier"
          : "+ New Manager";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>Kafy CRM</Text>
            <Text style={styles.tagline}>Operations desk · demo</Text>
          </View>
          <Pressable style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Reset demo</Text>
          </Pressable>
        </View>

        <View style={[styles.toolbar, compact && styles.toolbarCompact]}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={`Search ${tab}…`}
          />
          <Pressable style={styles.primaryBtn} onPress={openCreate}>
            <Text style={styles.primaryBtnText}>{newLabel}</Text>
          </Pressable>
        </View>

        <TopTabs active={tab} onChange={handleTabChange} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsRow}
        >
          <StatCard title="Total Tickets" value={stats.totalTickets} icon="▣" />
          <StatCard title="Open Tickets" value={stats.openTickets} icon="◉" />
          <StatCard
            title="Waiting Supplier"
            value={stats.waitingSupplier}
            icon="◔"
          />
          <StatCard
            title="Closed Tickets"
            value={stats.closedTickets}
            icon="✓"
          />
          <StatCard
            title="Avg Response"
            value={
              stats.avgResponseMinutes === null
                ? "—"
                : `${stats.avgResponseMinutes}m`
            }
            icon="◷"
          />
        </ScrollView>

        {tab === "tickets" ? (
          <FilterBar
            filters={filterDefs}
            values={filters}
            onChange={(key, value) =>
              setFilters((prev) => ({ ...prev, [key]: value }))
            }
            canClear={
              Boolean(search.trim()) ||
              Object.values(filters).some((value) => value && value !== "All")
            }
            onClear={() => {
              setFilters({});
              setSearch("");
            }}
          />
        ) : null}

        <View style={styles.tableArea}>
          {tab === "tickets" ? (
            <DataTable
              columns={ticketColumns}
              rows={ticketRows}
              sort={sort}
              onSort={handleSort}
              onRowPress={setDrawerEntity}
            />
          ) : null}
          {tab === "customers" ? (
            <DataTable
              columns={customerColumns}
              rows={customerRows}
              sort={sort}
              onSort={handleSort}
              onRowPress={setDrawerEntity}
            />
          ) : null}
          {tab === "suppliers" ? (
            <DataTable
              columns={supplierColumns}
              rows={supplierRows}
              sort={sort}
              onSort={handleSort}
              onRowPress={setDrawerEntity}
            />
          ) : null}
          {tab === "managers" ? (
            <DataTable
              columns={managerColumns}
              rows={managerRows}
              sort={sort}
              onSort={handleSort}
              onRowPress={setDrawerEntity}
            />
          ) : null}
        </View>
      </View>

      <Drawer
        visible={Boolean(drawerEntity)}
        tab={tab}
        entity={drawerEntity}
        crm={data}
        onClose={() => setDrawerEntity(null)}
        onReply={handleTicketReply}
        sendingReply={sendingReply}
      />

      <EntityFormModal
        visible={formMode !== null}
        tab={tab}
        mode={formMode ?? "create"}
        entity={formEntity}
        crm={data}
        onClose={() => {
          setFormMode(null);
          setFormEntity(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        visible={Boolean(pendingDelete)}
        title="Delete record?"
        message="This removes the item from local demo storage. You can restore seed data with Reset demo."
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  tagline: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedText,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  toolbarCompact: {
    flexWrap: "wrap",
  },
  statsScroll: {
    flexGrow: 0,
  },
  statsRow: {
    gap: spacing.sm,
    paddingVertical: 0,
    alignItems: "center",
  },

  tableArea: {
    flex: 1,
    minHeight: 280,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  dangerBtn: {
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
  dangerText: {
    color: colors.danger,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.mutedText,
  },
  errorText: {
    color: colors.danger,
    fontWeight: "600",
  },
});
