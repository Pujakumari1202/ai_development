import os

import requests
from flask import Flask, jsonify, request

from graph.builder import build_graph
from mcp_client import append_message_via_mcp
from mcp_client import complete_pending_supplier_outreach_via_mcp
from mcp_client import create_pending_supplier_outreach_via_mcp
from mcp_client import ensure_memory_tables_via_mcp
from mcp_client import find_supplier_by_phone_via_mcp
from mcp_client import find_pending_supplier_outreach_by_supplier_phone_via_mcp
from mcp_client import load_session_memory_via_mcp
from mcp_client import save_active_order_context_via_mcp


GRAPH = build_graph()
app = Flask(__name__)

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
GRAPH_API_VERSION = os.getenv("WHATSAPP_GRAPH_API_VERSION", "v20.0")


def build_session_id(customer_identifier):
    normalized = customer_identifier.strip().lower().replace(" ", "-")
    return f"customer-{normalized}" if normalized else "customer-guest"


def load_session_state(session_id):
    ensure_memory_tables_via_mcp()
    memory_payload = load_session_memory_via_mcp(session_id)
    return {
        "conversation_history": memory_payload.get("history", []),
        "active_order_context": memory_payload.get("active_order_context", {}),
    }


def normalize_whatsapp_recipient(phone_number: str) -> str:
    digits = "".join(character for character in str(phone_number or "") if character.isdigit())
    if not digits:
        return ""
    if digits.startswith("0"):
        digits = digits.lstrip("0")
    if not digits.startswith("91") and len(digits) == 10:
        digits = f"91{digits}"
    return digits


def build_supplier_outreach_message(result: dict) -> str:
    supplier_contact_result = result.get("supplier_contact_result") or {}
    entities = result.get("entities") or {}

    supplier_name = supplier_contact_result.get("supplier_name") or "Supplier"
    product_name = supplier_contact_result.get("product_name") or entities.get("product_name") or "the requested product"
    quantity = supplier_contact_result.get("quantity") or entities.get("quantity") or "the requested quantity"
    target_price = entities.get("target_price")
    required_by = entities.get("required_by") or result.get("turnaround_time") or "the requested date"

    target_price_text = f" Target price is QAR {target_price}." if target_price else ""

    return (
        f"Hello {supplier_name}, please confirm if you can supply {quantity} of {product_name} by {required_by}.{target_price_text} "
        "Please reply with your best price, total amount, delivery ETA, and stock confirmation."
    )


def should_contact_supplier(result: dict) -> bool:
    supplier_contact_result = result.get("supplier_contact_result") or {}

    if not supplier_contact_result:
        return False

    return bool(result.get("auto_contact_supplier"))


def contact_supplier_via_whatsapp(result: dict) -> dict:
    supplier_contact_result = result.get("supplier_contact_result") or {}
    phone_number = normalize_whatsapp_recipient(supplier_contact_result.get("phone_number"))
    if not phone_number:
        return {"status": "skipped", "reason": "missing_supplier_phone"}

    message = build_supplier_outreach_message(result)

    try:
        send_whatsapp_message(phone_number, message)
        return {
            "status": "sent",
            "recipient": phone_number,
            "message": message,
        }
    except Exception as exc:
        app.logger.exception("Failed to send supplier WhatsApp message to %s", phone_number)
        return {
            "status": "failed",
            "recipient": phone_number,
            "message": message,
            "reason": str(exc),
        }


def register_pending_supplier_outreach(customer_identifier: str, session_id: str, result: dict, supplier_message_status: dict) -> dict:
    if supplier_message_status.get("status") != "sent":
        return {}

    supplier_contact_result = result.get("supplier_contact_result") or {}
    supplier_phone_number = supplier_message_status.get("recipient") or normalize_whatsapp_recipient(
        supplier_contact_result.get("phone_number")
    )

    if not supplier_phone_number:
        return {}

    return create_pending_supplier_outreach_via_mcp(
        customer_session_id=session_id,
        customer_phone_number=normalize_whatsapp_recipient(customer_identifier),
        supplier_phone_number=supplier_phone_number,
        supplier_name=supplier_contact_result.get("supplier_name") or "Supplier",
        product_name=supplier_contact_result.get("product_name") or (result.get("entities") or {}).get("product_name") or "product",
        quantity=supplier_contact_result.get("quantity") or (result.get("entities") or {}).get("quantity"),
        request_message=supplier_message_status.get("message") or build_supplier_outreach_message(result),
    )


def relay_supplier_reply(sender: str, text: str) -> dict:
    pending = find_pending_supplier_outreach_by_supplier_phone_via_mcp(normalize_whatsapp_recipient(sender))
    if not pending:
        return {}

    completion = complete_pending_supplier_outreach_via_mcp(
        outreach_id=pending.get("outreach_id"),
        supplier_reply=text,
    )
    customer_phone_number = completion.get("customer_phone_number")
    supplier_name = completion.get("supplier_name") or pending.get("supplier_name") or "Supplier"
    product_name = completion.get("product_name") or pending.get("product_name") or "the product"
    customer_message = f"{supplier_name} replied for {product_name}: {text}"

    append_message_via_mcp(pending.get("customer_session_id"), "assistant", customer_message)

    return {
        "pending": pending,
        "completion": completion,
        "customer_phone_number": customer_phone_number,
        "customer_message": customer_message,
    }


def is_known_supplier(sender: str) -> bool:
    supplier_phone_number = normalize_whatsapp_recipient(sender)
    if not supplier_phone_number:
        return False

    supplier = find_supplier_by_phone_via_mcp(supplier_phone_number)
    return bool(supplier)


def handle_supplier_reply(sender: str, text: str) -> bool:
    relay_result = relay_supplier_reply(sender, text)
    if not relay_result:
        return False

    if relay_result.get("customer_phone_number"):
        send_whatsapp_message(relay_result["customer_phone_number"], relay_result["customer_message"])

    return True


def process_message(customer_identifier, user_input):
    session_id = build_session_id(customer_identifier)
    session_state = load_session_state(session_id)
    conversation_history = session_state["conversation_history"]
    active_order_context = session_state["active_order_context"]

    result = GRAPH.invoke(
        {
            "user_input": user_input,
            "conversation_history": conversation_history,
            "active_order_context": active_order_context,
        }
    )

    supplier_message_status = {}
    if should_contact_supplier(result):
        supplier_message_status = contact_supplier_via_whatsapp(result)
        result["supplier_message_status"] = supplier_message_status
        pending_outreach = register_pending_supplier_outreach(customer_identifier, session_id, result, supplier_message_status)
        if pending_outreach:
            result["pending_supplier_outreach"] = pending_outreach

    final_response = result.get("final_response", "")

    if supplier_message_status.get("status") == "sent":
        final_response = "I have sent that message to supplier. Once he reply I will response."
    elif supplier_message_status.get("status") == "failed":
        final_response = (
            "I found the supplier and tried to send the WhatsApp message, but the send failed. "
            f"Reason: {supplier_message_status.get('reason', 'unknown error')}."
        )

    if result.get("need_clarification"):
        final_response = result.get(
            "clarification_question",
            "Please share a few more details so I can help.",
        )
    elif result.get("need_human"):
        final_response = result.get(
            "pending_human_message",
            "Your request needs manual review. Our team will get back to you shortly.",
        )

    conversation_history = [
        *conversation_history,
        {"role": "customer", "message": user_input},
        {"role": "assistant", "message": final_response},
    ][-12:]

    append_message_via_mcp(session_id, "customer", user_input)
    append_message_via_mcp(session_id, "assistant", final_response)

    merged_context = dict(active_order_context)
    merged_context.update(result.get("entities", {}))

    if result.get("turnaround_time"):
        merged_context["turnaround_time"] = result["turnaround_time"]

    if result.get("operation_summary"):
        merged_context["last_operation_summary"] = result["operation_summary"]

    if result.get("db_result"):
        merged_context["last_db_result"] = result["db_result"]

    save_active_order_context_via_mcp(session_id, merged_context)

    return {
        "session_id": session_id,
        "final_response": final_response,
        "operation_summary": result.get("operation_summary"),
        "turnaround_time": result.get("turnaround_time"),
        "raw_result": result,
    }




def process_whatsapp_message(sender, text):
    return process_message(sender, text)


def send_whatsapp_message(recipient_id: str, text: str) -> None:
    if not ACCESS_TOKEN or not PHONE_NUMBER_ID:
        app.logger.warning(
            "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID. Skipping reply to %s.",
            recipient_id,
        )
        return

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{PHONE_NUMBER_ID}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "to": recipient_id,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": text,
        },
    }
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
    }

    response = requests.post(url, json=payload, headers=headers, timeout=15)
    response.raise_for_status()


@app.get("/sendzfammsg")
def health_check():
    send_whatsapp_message("+916290363971", "Health check")
    return jsonify({"status": "ok"}), 200


@app.get("/healthz")
def healthz():
    return jsonify({"status": "ok"}), 200


@app.get("/webhook")
def verify_webhook():
    mode = request.args.get("hub.mode")
    token = request.args.get("hub.verify_token")
    challenge = request.args.get("hub.challenge")
    print(f"Received webhook verification: {mode}, {token}, {challenge}")
    print(f"Expected: {VERIFY_TOKEN}")
    if mode == "subscribe" and token == VERIFY_TOKEN and challenge:
        return challenge, 200

    return "Verification failed", 403


@app.post("/webhook")
def receive_webhook():
    payload = request.get_json(silent=True) or {}

    print("Incoming webhook payload:")
    print(payload)

    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            for message in value.get("messages", []):
                sender = message.get("from")
                text = message.get("text", {}).get("body", "")

                print(f"Incoming message from {sender}: {text}")
                if not sender or not text:
                    continue

                try:
                    if is_known_supplier(sender):
                        if handle_supplier_reply(sender, text):
                            continue
                        app.logger.info("Ignoring supplier message without pending outreach from %s", sender)
                        continue

                    if handle_supplier_reply(sender, text):
                        continue
                    result = process_whatsapp_message(sender, text)
                    send_whatsapp_message(sender, result["final_response"])
                except Exception:
                    app.logger.exception("Failed to process WhatsApp message from %s", sender)
                    return jsonify({"status": "error"}), 500

    return jsonify({"status": "received"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)