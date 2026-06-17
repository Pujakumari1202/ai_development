# from app.server import mcp
# import app.tools

# if __name__ == "__main__":
#     mcp.run()

from dotenv import load_dotenv
import telebot
import os
#data
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

bot = telebot.TeleBot(token=TELEGRAM_TOKEN)

@bot.message_handler(commands=['start'])
def welcome(message):
    
    bot.send_message(message.chat.id, "Hi, Welcome to Telegram!")
bot.polling()