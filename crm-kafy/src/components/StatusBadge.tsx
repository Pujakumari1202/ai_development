import { StyleSheet, Text, View } from "react-native";

import type { TicketStatus } from "@/types/crm";
import { colors, radii } from "@/utils/crm-theme";

const STATUS_STYLES: Record<
  TicketStatus,
  { label: string; bg: string; fg: string }
> = {
  OPEN: { label: "Open", bg: colors.successSoft, fg: colors.success },
  WAITING_SUPPLIER: {
    label: "Waiting Supplier",
    bg: colors.warningSoft,
    fg: colors.warning,
  },
  WAITING_CUSTOMER: {
    label: "Waiting Customer",
    bg: colors.infoSoft,
    fg: colors.info,
  },
  CLOSED: { label: "Closed", bg: colors.closedSoft, fg: colors.closed },
};

type StatusBadgeProps = {
  status: TicketStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.fg }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
