import TelegramBot from "node-telegram-bot-api";
import { generateWalletCommands } from "../../commands/wallet";

export const walletClick = async (bot: TelegramBot, chatId: number) => {
  
  console.log("calling walletClick")
  const { title, content } = await generateWalletCommands()
  // console.log(msg);
  bot.sendMessage(chatId, title, {
    "reply_markup": {
      "inline_keyboard": content
    }, parse_mode: 'HTML'
  });
}