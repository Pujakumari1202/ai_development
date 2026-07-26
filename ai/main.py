import os

import requests
from flask import Flask, jsonify, request

from graph.builder import build_graph
from mcp_client import append_message_via_mcp
from mcp_client import ensure_memory_tables_via_mcp
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

    final_response = result.get("final_response", "")

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
                    result = process_whatsapp_message(sender, text)
                    send_whatsapp_message(sender, result["final_response"])
                except Exception:
                    app.logger.exception("Failed to process WhatsApp message from %s", sender)
                    return jsonify({"status": "error"}), 500

    return jsonify({"status": "received"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
