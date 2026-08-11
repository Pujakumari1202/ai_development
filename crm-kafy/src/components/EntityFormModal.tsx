import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type {
  ActiveTab,
  Contact,
  CRMData,
  Customer,
  Manager,
  Supplier,
  Ticket,
  TicketStatus,
} from "@/types/crm";
import { colors, radii, spacing } from "@/utils/crm-theme";

type EntityFormModalProps = {
  visible: boolean;
  tab: ActiveTab;
  mode: "create" | "edit";
  entity: Ticket | Customer | Supplier | Manager | null;
  crm: CRMData;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

type FormValues = Record<string, string>;

const TICKET_STATUSES: TicketStatus[] = [
  "OPEN",
  "WAITING_SUPPLIER",
  "WAITING_CUSTOMER",
  "CLOSED",
];

function contactPhone(contacts: Contact[]): string {
  return contacts[0]?.phone ?? "";
}

function contactEmail(contacts: Contact[]): string {
  return contacts[0]?.email ?? "";
}

export function EntityFormModal({
  visible,
  tab,
  mode,
  entity,
  crm,
  onClose,
  onSubmit,
}: EntityFormModalProps) {
  const initial = useMemo((): FormValues => {
    if (tab === "tickets") {
      const ticket = entity as Ticket | null;
      return {
        customer: ticket?.customer ?? crm.customers[0]?.name ?? "",
        supplier: ticket?.supplier ?? crm.suppliers[0]?.name ?? "",
        manager: ticket?.manager ?? crm.managers[0]?.name ?? "",
        status: ticket?.status ?? "OPEN",
        summary: ticket?.summary ?? "",
      };
    }
    if (tab === "customers") {
      const customer = entity as Customer | null;
      return {
        name: customer?.name ?? "",
        manager: customer?.manager ?? crm.managers[0]?.name ?? "",
        email: contactEmail(customer?.contacts ?? []),
        phone: contactPhone(customer?.contacts ?? []),
      };
    }
    if (tab === "suppliers") {
      const supplier = entity as Supplier | null;
      return {
        name: supplier?.name ?? "",
        email: contactEmail(supplier?.contacts ?? []),
        phone: contactPhone(supplier?.contacts ?? []),
      };
    }
    const manager = entity as Manager | null;
    return {
      name: manager?.name ?? "",
      email: manager?.email ?? "",
      phone: manager?.phone ?? "",
    };
  }, [crm, entity, tab]);

  const [values, setValues] = useState<FormValues>(initial);

  useEffect(() => {
    if (visible) setValues(initial);
  }, [initial, visible]);

  const title =
    mode === "create"
      ? `New ${tab === "tickets" ? "Ticket" : tab.slice(0, -1)}`
      : `Edit ${tab === "tickets" ? "Ticket" : tab.slice(0, -1)}`;

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView contentContainerStyle={styles.form}>
            {tab === "tickets" ? (
              <>
                <SelectField
                  label="Customer"
                  value={values.customer ?? ""}
                  options={crm.customers.map((c) => c.name)}
                  onChange={(value) => setField("customer", value)}
                />
                <SelectField
                  label="Supplier"
                  value={values.supplier ?? ""}
                  options={crm.suppliers.map((s) => s.name)}
                  onChange={(value) => setField("supplier", value)}
                />
                <SelectField
                  label="Manager"
                  value={values.manager ?? ""}
                  options={crm.managers.map((m) => m.name)}
                  onChange={(value) => setField("manager", value)}
                />
                <SelectField
                  label="Status"
                  value={values.status ?? ""}
                  options={TICKET_STATUSES}
                  onChange={(value) => setField("status", value)}
                />
                <Field
                  label="Summary"
                  value={values.summary ?? ""}
                  onChangeText={(value) => setField("summary", value)}
                  multiline
                />
              </>
            ) : null}

            {tab === "customers" ? (
              <>
                <Field
                  label="Customer"
                  value={values.name ?? ""}
                  onChangeText={(value) => setField("name", value)}
                />
                <SelectField
                  label="Account Manager"
                  value={values.manager ?? ""}
                  options={crm.managers.map((m) => m.name)}
                  onChange={(value) => setField("manager", value)}
                />
                <Field
                  label="Contact email"
                  value={values.email ?? ""}
                  onChangeText={(value) => setField("email", value)}
                />
                <Field
                  label="Contact phone"
                  value={values.phone ?? ""}
                  onChangeText={(value) => setField("phone", value)}
                />
              </>
            ) : null}

            {tab === "suppliers" ? (
              <>
                <Field
                  label="Supplier"
                  value={values.name ?? ""}
                  onChangeText={(value) => setField("name", value)}
                />
                <Field
                  label="Contact email"
                  value={values.email ?? ""}
                  onChangeText={(value) => setField("email", value)}
                />
                <Field
                  label="Contact phone"
                  value={values.phone ?? ""}
                  onChangeText={(value) => setField("phone", value)}
                />
              </>
            ) : null}

            {tab === "managers" ? (
              <>
                <Field
                  label="Manager"
                  value={values.name ?? ""}
                  onChangeText={(value) => setField("name", value)}
                />
                <Field
                  label="Email"
                  value={values.email ?? ""}
                  onChangeText={(value) => setField("email", value)}
                />
                <Field
                  label="Phone"
                  value={values.phone ?? ""}
                  onChangeText={(value) => setField("phone", value)}
                />
              </>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.primary}
              onPress={() => onSubmit(values)}
            >
              <Text style={styles.primaryText}>
                {mode === "create" ? "Create" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, multiline && styles.textarea]}
        multiline={multiline}
        placeholderTextColor={colors.mutedText}
      />
    </View>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {option.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(31,35,40,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedText,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
