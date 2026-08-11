import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ActiveTab } from "@/types/crm";
import { colors, radii, spacing } from "@/utils/crm-theme";

const TABS: { key: ActiveTab; label: string }[] = [
  { key: "tickets", label: "Open Tickets" },
  { key: "customers", label: "Customers" },
  { key: "suppliers", label: "Suppliers" },
  { key: "managers", label: "Managers" },
];

type TopTabsProps = {
  active: ActiveTab;
  onChange: (tab: ActiveTab) => void;
};

export function TopTabs({ active, onChange }: TopTabsProps) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.mutedText,
  },
  labelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
});
