import { StyleSheet, Text, View } from "react-native";

import type { ConversationMessage, MessageSender } from "@/types/crm";
import { formatDateTime } from "@/utils/date";
import { colors, radii, spacing } from "@/utils/crm-theme";

type ChatBubbleProps = {
  message: ConversationMessage;
};

const bubbleTheme: Record<
  MessageSender,
  {
    align: "flex-start" | "flex-end" | "center";
    background: string;
    border: string;
    text: string;
    meta: string;
  }
> = {
  CUSTOMER: {
    align: "flex-start",
    background: "#FFFFFF",
    border: colors.borderStrong,
    text: colors.text,
    meta: colors.mutedText,
  },
  SUPPLIER: {
    align: "flex-start",
    background: colors.warningSoft,
    border: "#E6C35C",
    text: colors.text,
    meta: "#8A6D00",
  },
  AGENT: {
    align: "flex-end",
    background: colors.accentSoft,
    border: colors.accent,
    text: colors.text,
    meta: colors.accentHover,
  },
  SYSTEM: {
    align: "center",
    background: colors.surfaceMuted,
    border: colors.border,
    text: colors.mutedText,
    meta: colors.mutedText,
  },
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const theme = bubbleTheme[message.sender] ?? bubbleTheme.CUSTOMER;

  return (
    <View style={[styles.row, { alignItems: theme.align }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.sender, { color: theme.meta }]}>
          {message.sender}
        </Text>
        <Text style={[styles.text, { color: theme.text }]}>{message.text}</Text>
        <Text style={[styles.time, { color: theme.meta }]}>
          {formatDateTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.sm,
  },
  bubble: {
    maxWidth: "88%",
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  sender: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
  time: {
    fontSize: 10,
  },
});
