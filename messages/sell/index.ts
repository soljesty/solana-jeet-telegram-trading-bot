import { Keypair, PublicKey } from "@solana/web3.js";
import TelegramBot from "node-telegram-bot-api";
import { getTokenAccountBalance, updateData, } from "../../utils";
import { getUserCacheById } from "../../controllers/user";
import { SECRET_KEY, solConnection } from "../../config";
import { generateSwapSellCommands } from "../../commands/sell";
import base58 from 'bs58';

export const sellClick = async (bot: TelegramBot, chatId: number) => {
  const secretKey: any = SECRET_KEY;
  const kp: Keypair = Keypair.fromSecretKey(base58.decode(secretKey));
  const pubKey = kp.publicKey.toBase58();
  
  bot.sendMessage(chatId, "Enter a token address to sell", { parse_mode: 'HTML' });
  
  bot.once('message', async (msg: any) => {
    if (!msg.text) return;
    const baseMint = msg.text;

    try {
      // Check if inputted address is valid
      const isValid: boolean = PublicKey.isOnCurve(new PublicKey(baseMint));
      if (!isValid) {
        throw new Error("Invalid token address");
      }

      let balance: any = 0;
      await updateData(chatId.toString(), { activeSellMint: baseMint });

      if (pubKey) {
        balance = await getTokenAccountBalance(solConnection, pubKey, baseMint);
      }

      // Check if ProfitMax mode is active for the user
      const userCache = await getUserCacheById(chatId.toString());
      if (userCache.profitMaxList && userCache.profitMaxList.length > 0) {
        // If ProfitMax is active, do not allow direct selling
        bot.sendMessage(chatId, "ProfitMax mode is active. Selling will be managed automatically.");
        return; // Exit the function to prevent direct selling
      }

      let param = { baseMint, balance };
      const { sell_title, sell_content } = await generateSwapSellCommands(param, chatId.toString());
      bot.sendMessage(chatId, sell_title, {
        "reply_markup": {
          "inline_keyboard": sell_content
        }, parse_mode: 'HTML'
      });

    } catch (err) {
      bot.sendMessage(chatId, "Token Address is not Valid... Try with another token!!", {
        "reply_markup": {
          "inline_keyboard": [
            [
              { text: 'Try Again', callback_data: 'Sell' },
              { text: 'Cancel', callback_data: 'Cancel' },
            ]
          ]
        },
        parse_mode: 'HTML'
      });
    }
  });
};