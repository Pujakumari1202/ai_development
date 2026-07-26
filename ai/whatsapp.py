import os

import requests
from flask import Flask, jsonify, request


app = Flask(__name__)

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
GRAPH_API_VERSION = os.getenv("WHATSAPP_GRAPH_API_VERSION")


def send_whatsapp_message(recipient_id: str, text: str) -> None:
    if not ACCESS_TOKEN or not PHONE_NUMBER_ID:
        app.logger.warning(
            "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID. "
            "Skipping reply to %s.",
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
                #send tect to bot for further processing

    return jsonify({"status": "received"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT"))
    app.run(host="0.0.0.0", port=port, debug=True)
