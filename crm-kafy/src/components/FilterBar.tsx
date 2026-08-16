import { createElement, useState, type CSSProperties } from "react";
import {
  Modal,
  Platform,
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
  onClear?: () => void;
  /** When set, controls Clear button enabled state (e.g. include search). */
  canClear?: boolean;
};

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  canClear,
}: FilterBarProps) {
  if (filters.length === 0) return null;

  const hasActiveFilters = filters.some((filter) => {
    const value = values[filter.key];
    return Boolean(value) && value !== "All";
  });
  const clearEnabled = canClear ?? hasActiveFilters;

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }
    for (const filter of filters) {
      onChange(filter.key, "All");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Filters</Text>
        <Pressable
          onPress={handleClear}
          disabled={!clearEnabled}
          style={[styles.clearBtn, !clearEnabled && styles.clearBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Clear filters"
        >
          <Text
            style={[
              styles.clearText,
              !clearEnabled && styles.clearTextDisabled,
            ]}
          >
            Clear filters
          </Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        {filters.map((filter) => {
          const selected = values[filter.key] || "All";
          const options = ["All", ...filter.options];
          return (
            <View key={filter.key} style={styles.field}>
              <Text style={styles.groupLabel}>{filter.label}</Text>
              <FilterSelect
                value={selected}
                options={options}
                onChange={(value) => onChange(filter.key, value)}
                label={filter.label}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === "web") {
    return (
      <View style={styles.selectWrap}>
        {createElement(
          "select",
          {
            "aria-label": label,
            value,
            onChange: (event: { target: { value: string } }) =>
              onChange(event.target.value),
            style: webSelectStyle,
          },
          options.map((option) =>
            createElement("option", { key: option, value: option }, option),
          ),
        )}
      </View>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.selectTrigger}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        <Text style={styles.selectValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.menuBackdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.menuPanel}
            onPress={(event) => event.stopPropagation()}
          >
            <Text style={styles.menuTitle}>{label}</Text>
            <ScrollView style={styles.menuScroll}>
              {options.map((option) => {
                const active = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                    style={[styles.menuItem, active && styles.menuItemActive]}
                  >
                    <Text
                      style={[
                        styles.menuItemText,
                        active && styles.menuItemTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const webSelectStyle: CSSProperties = {
  width: "100%",
  minWidth: 140,
  maxWidth: 200,
  height: 34,
  borderRadius: radii.sm,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: colors.borderStrong,
  backgroundColor: colors.surface,
  color: colors.text,
  fontSize: 13,
  paddingLeft: 10,
  paddingRight: 28,
  outline: "none",
  cursor: "pointer",
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearBtnDisabled: {
    opacity: 0.45,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  clearTextDisabled: {
    color: colors.mutedText,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    alignItems: "flex-end",
  },
  field: {
    gap: spacing.xs,
    minWidth: 140,
    maxWidth: 200,
    flexGrow: 1,
    flexBasis: 140,
  },
  groupLabel: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: "500",
  },
  selectWrap: {
    borderRadius: radii.sm,
  },
  selectTrigger: {
    minHeight: 34,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  selectValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  chevron: {
    fontSize: 12,
    color: colors.mutedText,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(31,35,40,0.35)",
    justifyContent: "center",
    padding: spacing.xl,
  },
  menuPanel: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 360,
    overflow: "hidden",
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuScroll: {
    maxHeight: 320,
  },
  menuItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemActive: {
    backgroundColor: colors.accentSoft,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.text,
  },
  menuItemTextActive: {
    color: colors.accent,
    fontWeight: "600",
  },
});
