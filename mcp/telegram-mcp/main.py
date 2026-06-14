# from app.server import mcp
# import app.tools

# if __name__ == "__main__":
#     mcp.run()

from config import TELEGRAM_TOKEN
import telebot


bot = telebot.TeleBot(token=TELEGRAM_TOKEN)

@bot.message_handler(commands=['start'])
def welcome(message):
    
    bot.send_message(message.chat.id, "Hi, Welcome to Telegram!")
bot.polling()