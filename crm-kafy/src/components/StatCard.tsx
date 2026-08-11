import { Platform, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/utils/crm-theme";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
};

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 140,
    minWidth: 130,
    maxWidth: 200,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...Platform.select({
      web: { boxShadow: `0 1px 4px ${colors.shadow}` },
      default: {
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      },
    }),
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 13,
  },
  copy: {
    flex: 1,
    gap: 0,
    justifyContent: "center",
  },
  title: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.mutedText,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.text,
  },
});
