import telebot
import os
from dotenv import load_dotenv

from app import run_agent

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

bot = telebot.TeleBot(TELEGRAM_TOKEN)


@bot.message_handler()
def handle_message(message):
    print(message)

    user_input = message.text



    response = run_agent(user_input)

    # bot.reply_to(message, response)
    print(response)


print("Telegram Bot Started...")
bot.polling()