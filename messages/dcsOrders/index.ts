import TelegramBot from "node-telegram-bot-api";
import { getDCAOrdersByUserId } from "../../controllers/user";
import { getRemainTime } from "../../utils";

export const DCAOrderClick = async (bot: TelegramBot, chatId: number) => {
  const limitOrders = await getDCAOrdersByUserId(chatId.toString())
  let msgTitle = `Active DCA Orders:`
  if(limitOrders.length > 0){
    for (let i = 0; i < limitOrders.length; i++) {
      msgTitle += `\n\n ${limitOrders[i].type}  <code>${limitOrders[i].tokenMint}</code>  (${limitOrders[i].solAmount} ${limitOrders[i].type === 'Buy' ? 'SOL': '%'})\n
      No of orders: ${limitOrders[i].orderNum} \n
      Expires: ${limitOrders[i].expiredAt} (${getRemainTime(limitOrders[i].expiredAt - Date.now())} Remained)
      Current: ${Date.now()} 
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
            { text: 'Close All', callback_data: 'Close_All_DCA' },
          ],
          [
            { text: 'Cancel', callback_data: 'Cancel' },
          ]
        ]
      },
      parse_mode: 'HTML'
    });
}