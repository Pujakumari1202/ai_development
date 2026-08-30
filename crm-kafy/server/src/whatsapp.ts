import { config } from "./config.js";

export type WhatsAppResult =
  | { ok: true; messageId: string | null }
  | {
      ok: false;
      reason: "missing_credentials" | "request_failed";
      message: string;
    };

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendWhatsAppMessage(
  recipientId: string,
  text: string,
  fetcher: typeof fetch = fetch,
): Promise<WhatsAppResult> {
  if (!config.WHATSAPP_ACCESS_TOKEN || !config.WHATSAPP_PHONE_NUMBER_ID) {
    return {
      ok: false,
      reason: "missing_credentials",
      message: "WhatsApp credentials are not configured on the server.",
    };
  }

  const to = normalizePhone(recipientId);
  if (!to) {
    return {
      ok: false,
      reason: "request_failed",
      message: "Recipient phone number is empty after normalizing.",
    };
  }

  try {
    const response = await fetcher(
      `https://graph.facebook.com/${config.WHATSAPP_GRAPH_API_VERSION}/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: text },
        }),
      },
    );
    const body = await response.json().catch(() => null) as
      | { messages?: Array<{ id?: string }>; error?: { message?: string } }
      | null;
    if (!response.ok) {
      return {
        ok: false,
        reason: "request_failed",
        message: body?.error?.message ?? `WhatsApp API returned ${response.status}`,
      };
    }
    return { ok: true, messageId: body?.messages?.[0]?.id ?? null };
  } catch (error) {
    return {
      ok: false,
      reason: "request_failed",
      message: error instanceof Error ? error.message : "WhatsApp request failed",
    };
  }
}
