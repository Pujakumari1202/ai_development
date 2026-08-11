import { StyleSheet, Text, View } from "react-native";

import type { Contact } from "@/types/crm";
import { colors, radii, spacing } from "@/utils/crm-theme";

type ContactListProps = {
  contacts: Contact[];
  title?: string;
};

export function ContactList({
  contacts,
  title = "Contacts",
}: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>No contacts</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {contacts.map((contact) => (
        <View key={contact.id} style={styles.card}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.meta}>{contact.email}</Text>
          <Text style={styles.meta}>{contact.phone}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  empty: {
    fontSize: 13,
    color: colors.mutedText,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    gap: 2,
    backgroundColor: colors.surface,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.mutedText,
  },
});
