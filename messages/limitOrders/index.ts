import TelegramBot from "node-telegram-bot-api";
import { getLimitOrdersByUserId } from "../../controllers/user";
import { getRemainTime } from "../../utils";

export const limitOrderClick = async (bot: TelegramBot, chatId: number) => {
  const limitOrders = await getLimitOrdersByUserId(chatId.toString())
  let msgTitle = `Active Limit Orders:`
  if(limitOrders.length > 0) {
    for (let i = 0; i < limitOrders.length; i++) {
      msgTitle += `\n\n ${limitOrders[i].type}  <code>${limitOrders[i].tokenMint}</code>  (${limitOrders[i].solAmount} SOL)\n
      Trigger price: ${limitOrders[i].triggerPrice} SOL\n
      Expires: ${limitOrders[i].expiredAt}(${getRemainTime(limitOrders[i].expiredAt - Date.now())} Remained)
      `
    }
  }else{
    msgTitle += `\n\nNo Active Orders`
  }
  await bot.sendMessage(
    chatId,
    msgTitle,
    {
      "reply_markup": {
        "inline_keyboard": [
          [
            { text: 'Close All', callback_data: 'Close_All_Limit' },
          ],
          [
            { text: 'Cancel', callback_data: 'Cancel' },
          ]
        ]
      },
      parse_mode: 'HTML'
    });
}