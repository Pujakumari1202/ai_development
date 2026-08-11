import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import type { SortState } from "@/types/crm";
import { colors, radii, spacing } from "@/utils/crm-theme";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  width: number;
  sortable?: boolean;
  render: (row: T) => ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  sort: SortState;
  onSort: (key: string) => void;
  onRowPress: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  sort,
  onSort,
  onRowPress,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting search or filters.",
}: DataTableProps<T>) {
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  return (
    <View style={styles.shell}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ minWidth: tableWidth }}>
          <View style={[styles.headerRow, { width: tableWidth }]}>
            {columns.map((column) => {
              const active = sort?.key === column.key;
              return (
                <Pressable
                  key={column.key}
                  disabled={!column.sortable}
                  onPress={() => column.sortable && onSort(column.key)}
                  style={[styles.headerCell, { width: column.width }]}
                >
                  <Text style={styles.headerText}>
                    {column.label}
                    {active
                      ? sort?.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : column.sortable
                        ? ""
                        : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {rows.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            rows.map((row, index) => (
              <Pressable
                key={row.id}
                onPress={() => onRowPress(row)}
                style={({ pressed }) =>
                  [
                    styles.row,
                    { width: tableWidth },
                    index % 2 === 1 && styles.rowAlt,
                    pressed && styles.rowHover,
                  ] as StyleProp<ViewStyle>
                }
              >
                {columns.map((column) => (
                  <View
                    key={column.key}
                    style={[styles.cell, { width: column.width }]}
                  >
                    {column.render(row)}
                  </View>
                ))}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export function CellText({
  children,
  muted,
  ellipsis,
}: {
  children: string;
  muted?: boolean;
  ellipsis?: boolean;
}) {
  return (
    <Text
      numberOfLines={ellipsis ? 1 : undefined}
      style={[styles.cellText, muted && styles.muted]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 48,
  },
  rowAlt: {
    backgroundColor: colors.rowAlt,
  },
  rowHover: {
    backgroundColor: colors.accentSoft,
  },
  cell: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 13,
    color: colors.text,
  },
  muted: {
    color: colors.mutedText,
  },
});
