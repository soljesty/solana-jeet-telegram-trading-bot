import TelegramBot from "node-telegram-bot-api";
import { getDCAOrdersByUserId, getUserCacheById } from "../../controllers/user";
import { getRemainTime } from "../../utils";
import { getSnipeKeyBoard } from "../../keyboards/snipe";

export const snipeClick = async (bot: TelegramBot, chatId: number) => {
  const user_cache = await getUserCacheById(chatId.toString())
  console.log("user_cache", user_cache)
  const snipeLists = user_cache.snipeList ? user_cache.snipeList : []
  console.log("snipeLists", snipeLists)
  const limitOrders = await getDCAOrdersByUserId(chatId.toString())
  let msgTitle = `Snipe List:`
  if(snipeLists.length > 0){
    for (let i = 0; i < snipeLists.length; i++) {
      msgTitle += `\n<code>${snipeLists[i]}</code>
      `
    }
  }else{
    msgTitle += `\n\nNo Snipe Orders`
  }

  const keyboard= await getSnipeKeyBoard(chatId.toString())
  await bot.sendMessage(
    chatId,
    msgTitle,
    {
      "reply_markup": {
        "inline_keyboard": keyboard
      },
      parse_mode: 'HTML'
    });
}