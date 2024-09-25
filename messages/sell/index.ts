import { Message, PublicKey } from "@solana/web3.js";
import TelegramBot from "node-telegram-bot-api";
import { getUserCacheById, getUserPubKey } from "../../controllers/user";
import { getTokenAccountBalance, updateData } from "../../utils";
import { solConnection } from "../../config";
import { getPoolIdFromDexScreener } from "../../utils/poolKeys";
import { generateSwapSellCommands } from "../../commands/sell";

export const sellClick = async (bot: TelegramBot, chatId: number) => {
  const pubKey = await getUserPubKey(chatId.toString())
  bot.sendMessage(chatId, "Enter a token address to sell", { parse_mode: 'HTML' });
  bot.once('message', async (msg: any) => {
    if (!msg.text) return;
    const baseMint = msg.text
    // await getUserCacheById(chatId.toString())
    try {
      // check if inputted address is valid
      const isValid: boolean = PublicKey.isOnCurve(new PublicKey(baseMint))
      // if (!isValid) return;
      // const poolId: PublicKey | null = await getPoolIdFromDexScreener(new PublicKey(baseMint))
      // console.log("poolId---->", poolId)

      // if (poolId) {
        let balance: any = 0;
        await updateData(
          chatId.toString(),
          {
            activeSellMint: baseMint,
            // activeSellPoolId: poolId.toBase58()
          }
        )
        if (pubKey) {
          balance = await getTokenAccountBalance(solConnection, pubKey, baseMint)
          // balance  = await getTokenBalance(solConnection, "Ff1EKHGqtZyWagAy6XUVBLnJFSU6CAsEuUi4G586RWe7", "2Keh7DPf2qxQ9nHUqHJ4TfufnPBEn4gcA9f1K4nXCFJG")
          // balance  = await getTokenBalance(solConnection, pubKey, baseMint)
        }

        let param = {
          // poolId,
          baseMint,
          balance
        }
        console.log("param", param)
        const { sell_title, sell_content } = await generateSwapSellCommands(param, chatId.toString())
        bot.sendMessage(chatId, sell_title, {
          "reply_markup": {
            "inline_keyboard": sell_content
          }, parse_mode: 'HTML'
        });
      // } else {
      //   bot.sendMessage(chatId, "Pool ID is not existing... Try with another token!!", {
      //     "reply_markup": {
      //       "inline_keyboard": [
      //         [
      //           { text: 'Try Again', callback_data: 'Sell' },
      //           { text: 'Cancel', callback_data: 'Cancel' },
      //         ]
      //       ]
      //     },
      //     parse_mode: 'HTML'
      //   });
      // }
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
  })
}