import { ApiError, apiRequest } from "@/services/api";

export type SendWhatsAppResult =
  | { ok: true }
  | {
      ok: false;
      reason: "missing_credentials" | "request_failed";
      message: string;
    };

/**
 * Send a text message via WhatsApp Cloud API.
 * `recipientId` should be a phone number; non-digits are stripped.
 */
export async function sendWhatsAppMessage(
  recipientId: string,
  text: string,
): Promise<SendWhatsAppResult> {
  try {
    await apiRequest<
      { ok: true; messageId: string | null } | SendWhatsAppResult
    >("/api/whatsapp/messages", {
      method: "POST",
      body: JSON.stringify({ recipientId, text }),
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof ApiError && error.status === 503
        ? "missing_credentials"
        : "request_failed",
      message: error instanceof Error ? error.message : "WhatsApp send failed",
    };
  }
}
