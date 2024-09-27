import { getUserCacheById } from "../controllers/user";

export const getSwapSellKeyBoard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId)
  const keyboard = [
    [
      { text: `Swap`, callback_data: `cc` },
    ],
    [
      { text: `${user_cache.activeSellSwapPercent === 5 ? '✅' : ''}5%`, callback_data: `SwapSell_5` },
      { text: `${user_cache.activeSellSwapPercent === 10 ? '✅' : ''}10%`, callback_data: `SwapSell_10` },
      { text: `${user_cache.activeSellSwapPercent === 20 ? '✅' : ''}20%`, callback_data: `SwapSell_20` },
    ],
    [
      { text: `${user_cache.activeSellSwapPercent === 50 ? '✅' : ''}50%`, callback_data: `SwapSell_50` },
      { text: `${user_cache.activeSellSwapPercent === 100 ? '✅' : ''}100%`, callback_data: `SwapSell_100` },
      { 
        text: `${user_cache.activeSellSwapPercent && ![5, 10, 20, 50, 100].includes(user_cache.activeSellSwapPercent) ? '✅' + user_cache.activeSellSwapPercent : 'X'} %`, 
        callback_data: `SwapSell_X` 
      },
      
    ],
    [
      { text: `Sell`, callback_data: `Swap_Sell_Action` },
    ],
  ]
  return keyboard;
}
