import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { FilterDefinition } from "@/types/crm";
import { colors, radii, spacing } from "@/utils/crm-theme";

type FilterBarProps = {
  filters: FilterDefinition[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filters</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {filters.map((filter) => (
          <View key={filter.key} style={styles.group}>
            <Text style={styles.groupLabel}>{filter.label}</Text>
            <View style={styles.chips}>
              <Chip
                label="All"
                active={!values[filter.key] || values[filter.key] === "All"}
                onPress={() => onChange(filter.key, "All")}
              />
              {filter.options.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  active={values[filter.key] === option}
                  onPress={() => onChange(filter.key, option)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  row: {
    gap: spacing.lg,
    paddingBottom: 2,
  },
  group: {
    gap: spacing.xs,
  },
  groupLabel: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: "500",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
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
});
