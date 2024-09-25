import TelegramBot from "node-telegram-bot-api";
import { generateWalletCommands } from "../../commands/wallet";
import { createCompressedNftOperation } from "@metaplex-foundation/js";

export const walletClick = async (bot: TelegramBot, pubkey: string, chatId: number) => {
  
  console.log("calling walletClick")
  const { title, content } = await generateWalletCommands(chatId.toString())
  // console.log(msg);
  bot.sendMessage(chatId, title, {
    "reply_markup": {
      "inline_keyboard": content
    }, parse_mode: 'HTML'
  });
}