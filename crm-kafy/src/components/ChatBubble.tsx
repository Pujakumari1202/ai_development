import { StyleSheet, Text, View } from "react-native";

import type { ConversationMessage } from "@/types/crm";
import { formatDateTime } from "@/utils/date";
import { colors, radii, spacing } from "@/utils/crm-theme";

type ChatBubbleProps = {
  message: ConversationMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAgent = message.sender === "AGENT";
  const isSystem = message.sender === "SYSTEM";

  return (
    <View
      style={[
        styles.row,
        isAgent && styles.rowAgent,
        isSystem && styles.rowSystem,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isAgent && styles.bubbleAgent,
          isSystem && styles.bubbleSystem,
        ]}
      >
        <Text style={styles.sender}>{message.sender}</Text>
        <Text style={[styles.text, isAgent && styles.textAgent]}>
          {message.text}
        </Text>
        <Text style={[styles.time, isAgent && styles.timeAgent]}>
          {formatDateTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  rowAgent: {
    alignItems: "flex-end",
  },
  rowSystem: {
    alignItems: "center",
  },
  bubble: {
    maxWidth: "88%",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleAgent: {
    backgroundColor: colors.accent,
  },
  bubbleSystem: {
    backgroundColor: colors.closedSoft,
  },
  sender: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.mutedText,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  text: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  textAgent: {
    color: "#FFFFFF",
  },
  time: {
    fontSize: 10,
    color: colors.mutedText,
  },
  timeAgent: {
    color: "rgba(255,255,255,0.8)",
  },
});
