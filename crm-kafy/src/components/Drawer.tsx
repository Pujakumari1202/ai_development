import { useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ChatBubble } from "@/components/ChatBubble";
import { ContactList } from "@/components/ContactList";
import { StatusBadge } from "@/components/StatusBadge";
import type {
  ActiveTab,
  CRMData,
  Customer,
  Manager,
  Supplier,
  Ticket,
} from "@/types/crm";
import { formatDateTime, formatRelativeTime } from "@/utils/date";
import { colors, radii, spacing } from "@/utils/crm-theme";

type DrawerProps = {
  visible: boolean;
  tab: ActiveTab;
  entity: Ticket | Customer | Supplier | Manager | null;
  crm: CRMData;
  sendingReply?: boolean;
  onClose: () => void;
  onReply?: (ticketId: string, text: string) => Promise<void> | void;
};

export function Drawer({
  visible,
  tab,
  entity,
  crm,
  sendingReply = false,
  onClose,
  onReply,
}: DrawerProps) {
  const [reply, setReply] = useState("");

  const details = useMemo(() => {
    if (!entity) return null;

    if (tab === "tickets") {
      const ticket = entity as Ticket;
      const liveTicket =
        crm.tickets.find((item) => item.id === ticket.id) ?? ticket;
      return {
        title: liveTicket.customer,
        subtitle: liveTicket.summary,
        customer: liveTicket.customer,
        supplier: liveTicket.supplier,
        manager: liveTicket.manager,
        status: liveTicket.status,
        summary: liveTicket.summary,
        updatedAt: liveTicket.updatedAt,
        contacts:
          crm.customers.find((c) => c.name === liveTicket.customer)
            ?.contacts ?? [],
        supplierContacts:
          crm.suppliers.find((s) => s.name === liveTicket.supplier)
            ?.contacts ?? [],
        conversation: liveTicket.conversation,
        ticketId: liveTicket.id,
      };
    }

    if (tab === "customers") {
      const customer = entity as Customer;
      const tickets = crm.tickets.filter((t) => t.customer === customer.name);
      return {
        title: customer.name,
        subtitle: `Account manager: ${customer.manager}`,
        manager: customer.manager,
        contacts: customer.contacts,
        openCount: tickets.filter((t) => t.status !== "CLOSED").length,
        closedCount: tickets.filter((t) => t.status === "CLOSED").length,
        lastActivity: tickets[0]?.updatedAt,
      };
    }

    if (tab === "suppliers") {
      const supplier = entity as Supplier;
      const tickets = crm.tickets.filter((t) => t.supplier === supplier.name);
      return {
        title: supplier.name,
        subtitle: `${supplier.contacts.length} contacts`,
        contacts: supplier.contacts,
        openCount: tickets.filter((t) => t.status !== "CLOSED").length,
        closedCount: tickets.filter((t) => t.status === "CLOSED").length,
        lastActivity: tickets[0]?.updatedAt,
      };
    }

    const manager = entity as Manager;
    const tickets = crm.tickets.filter((t) => t.manager === manager.name);
    const accounts = crm.customers.filter((c) => c.manager === manager.name);
    return {
      title: manager.name,
      subtitle: manager.email,
      phone: manager.phone,
      email: manager.email,
      accounts: accounts.map((a) => a.name),
      openCount: tickets.filter((t) => t.status !== "CLOSED").length,
      closedCount: tickets.filter((t) => t.status === "CLOSED").length,
    };
  }, [crm, entity, tab]);

  if (!visible || !details) return null;

  const handleSend = async () => {
    const text = reply.trim();
    if (!text || !details || !("ticketId" in details) || !details.ticketId || !onReply) {
      return;
    }
    await onReply(details.ticketId, text);
    setReply("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.panel}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{details.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {details.subtitle}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {tab === "tickets" && details && "status" in details && details.status ? (
              <>
                <View style={styles.metaGrid}>
                  <Meta label="Customer" value={details.customer ?? ""} />
                  <Meta label="Supplier" value={details.supplier ?? ""} />
                  <Meta label="Manager" value={details.manager ?? ""} />
                  <View style={styles.meta}>
                    <Text style={styles.metaLabel}>Status</Text>
                    <StatusBadge status={details.status} />
                  </View>
                  <Meta
                    label="Updated"
                    value={formatRelativeTime(details.updatedAt ?? new Date().toISOString())}
                  />
                </View>

                <Section title="Summary">
                  <Text style={styles.summary}>{details.summary}</Text>
                </Section>

                <ContactList
                  contacts={details.contacts ?? []}
                  title="Customer contacts"
                />
                <ContactList
                  contacts={details.supplierContacts ?? []}
                  title="Supplier contacts"
                />

                <Section title="Timeline / Conversation">
                  {(details.conversation ?? []).map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}
                </Section>
              </>
            ) : null}

            {tab === "customers" && "openCount" in details ? (
              <>
                <View style={styles.metaGrid}>
                  <Meta label="Account Manager" value={details.manager!} />
                  <Meta label="Open tickets" value={String(details.openCount)} />
                  <Meta
                    label="Closed tickets"
                    value={String(details.closedCount)}
                  />
                  <Meta
                    label="Last activity"
                    value={
                      details.lastActivity
                        ? formatDateTime(details.lastActivity)
                        : "—"
                    }
                  />
                </View>
                <ContactList contacts={details.contacts ?? []} />
              </>
            ) : null}

            {tab === "suppliers" && "openCount" in details ? (
              <>
                <View style={styles.metaGrid}>
                  <Meta
                    label="Open requests"
                    value={String(details.openCount)}
                  />
                  <Meta
                    label="Completed"
                    value={String(details.closedCount)}
                  />
                  <Meta
                    label="Last response"
                    value={
                      details.lastActivity
                        ? formatDateTime(details.lastActivity)
                        : "—"
                    }
                  />
                </View>
                <ContactList contacts={details.contacts ?? []} />
              </>
            ) : null}

            {tab === "managers" && "email" in details ? (
              <>
                <View style={styles.metaGrid}>
                  <Meta label="Email" value={details.email!} />
                  <Meta label="Phone" value={details.phone!} />
                  <Meta
                    label="Assigned accounts"
                    value={(details.accounts ?? []).join(", ") || "—"}
                  />
                  <Meta label="Open tickets" value={String(details.openCount)} />
                  <Meta
                    label="Closed tickets"
                    value={String(details.closedCount)}
                  />
                </View>
              </>
            ) : null}
          </ScrollView>

          {tab === "tickets" && onReply ? (
            <View style={styles.composer}>
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder="Reply via WhatsApp…"
                placeholderTextColor={colors.mutedText}
                style={styles.replyInput}
                multiline
                editable={!sendingReply}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  (!reply.trim() || sendingReply) && styles.sendDisabled,
                ]}
                disabled={!reply.trim() || sendingReply}
                onPress={() => {
                  void handleSend();
                }}
              >
                {sendingReply ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.sendText}>Send</Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "rgba(31,35,40,0.35)",
  },
  scrim: {
    flex: 1,
  },
  panel: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    ...Platform.select({
      web: { boxShadow: `-4px 0 16px ${colors.shadow}` },
      default: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 16,
        shadowOffset: { width: -4, height: 0 },
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  metaGrid: {
    gap: spacing.md,
  },
  meta: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 14,
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  summary: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  replyInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: "top",
  },
  sendBtn: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: "center",
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
