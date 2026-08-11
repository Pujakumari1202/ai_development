/**
 * WhatsApp Cloud API helper (Meta Graph API).
 * Soft-fails when credentials are missing so the CRM still works offline.
 *
 * Demo note: EXPO_PUBLIC_* values are inlined into the client bundle.
 * Production should proxy sends through a backend.
 */

const ACCESS_TOKEN = process.env.EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN ?? "";
const PHONE_NUMBER_ID = process.env.EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID ?? "";
const GRAPH_API_VERSION =
  process.env.EXPO_PUBLIC_WHATSAPP_GRAPH_API_VERSION ?? "v21.0";

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

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
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.warn(
      "[whatsapp] Missing EXPO_PUBLIC_WHATSAPP_ACCESS_TOKEN or EXPO_PUBLIC_WHATSAPP_PHONE_NUMBER_ID; skipping send.",
    );
    return {
      ok: false,
      reason: "missing_credentials",
      message: "WhatsApp credentials are not configured.",
    };
  }

  const to = digitsOnly(recipientId);
  if (!to) {
    return {
      ok: false,
      reason: "request_failed",
      message: "Recipient phone number is empty after normalizing.",
    };
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body: text },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const message = `WhatsApp API error ${response.status}: ${body || response.statusText}`;
      console.warn("[whatsapp]", message);
      return { ok: false, reason: "request_failed", message };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown WhatsApp send error";
    console.warn("[whatsapp]", message);
    return { ok: false, reason: "request_failed", message };
  }
}
