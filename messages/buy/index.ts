import { Keypair, PublicKey } from "@solana/web3.js";
import TelegramBot from "node-telegram-bot-api";
import {
  getUserCacheById
} from "../../controllers/user";
import {
  getTokenAccountBalance,
  getTokenBalance,
  updateData,
} from "../../utils";
import { SECRET_KEY, solConnection } from "../../config";
import { generateSwapBuyCommands } from "../../commands/buy";
import { buyWithJupiter } from "../../utils/trade";
import base58 from "bs58";
import { BUY_SUCCESS_MSG } from "../../constants/msg.constants";

export const buyClick = async (bot: TelegramBot, chatId: number) => {
  const secretKey: any = SECRET_KEY
  const kp: Keypair = Keypair.fromSecretKey(base58.decode(secretKey))
  const pubKey = kp.publicKey.toBase58()

  bot.sendMessage(chatId, "Enter a token address to buy", {
    parse_mode: "HTML",
  });
  bot.once("message", async (msg: any) => {
    if (!msg.text) return;
    const baseMint = msg.text;
    const user_cache = await getUserCacheById(chatId.toString());
    try {
      // check if inputted address is valid
      const isValid: boolean = PublicKey.isOnCurve(new PublicKey(baseMint));
      console.log("isValid", isValid);
      // if (!isValid) return;
      // const poolId: PublicKey | null = await getPoolIdFromDexScreener(new PublicKey(baseMint))
      // if (poolId) {
      let balance: any = 0;
      await updateData(chatId.toString(), {
        activeBuyMint: baseMint,
        // activeBuyPoolId: poolId.toBase58()
      });
      if (pubKey) {
        balance = await getTokenAccountBalance(solConnection, pubKey, baseMint);
      }
      if (user_cache.isAutoBuyEnabled) {
        // const txLink = await buy(
        //   Keypair.fromSecretKey(base58.decode(secretKey)),
        //   new PublicKey(user_cache.activeBuyPoolId),
        //   new PublicKey(user_cache.activeBuyMint),
        //   user_cache.autoBuyAmount ? user_cache.autoBuyAmount : 0.01
        // )
        const txLink = await buyWithJupiter(
          Keypair.fromSecretKey(base58.decode(secretKey)),
          new PublicKey(user_cache.activeBuyMint),
          user_cache.autoBuyAmount ? user_cache.autoBuyAmount : 0.01
        );
        console.log("txLink", txLink);
        if (txLink) {
          bot.sendMessage(chatId, BUY_SUCCESS_MSG, { parse_mode: "HTML" });
        }
      } else {
        let param = {
          // poolId,
          baseMint,
          balance,
        };
        console.log("param", param);
        const { buy_title, buy_content } = await generateSwapBuyCommands(
          param,
          chatId.toString()
        );
        bot.sendMessage(chatId, buy_title, {
          reply_markup: {
            inline_keyboard: buy_content,
          },
          parse_mode: "HTML",
        });
      }

      // } else {
      //   bot.sendMessage(chatId, "Pool ID is not existing... Try with another token!!", {
      //     "reply_markup": {
      //       "inline_keyboard": [
      //         [
      //           { text: 'Try Again', callback_data: 'Buy' },
      //           { text: 'Cancel', callback_data: 'Cancel' },
      //         ]
      //       ]
      //     },
      //     parse_mode: 'HTML'
      //   });
      // }
    } catch (err) {
      bot.sendMessage(
        chatId,
        "Token Address is not Valid... Try with another token!!",
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Try Again", callback_data: "Buy" },
                { text: "Cancel", callback_data: "Cancel" },
              ],
            ],
          },
          parse_mode: "HTML",
        }
      );
    }
  });
};
