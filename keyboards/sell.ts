import { UserCache } from "../config";
import { getUserCacheById } from "../controllers/user";

export const getSwapSellKeyBoard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId)
  const keyboard = [
    [
      { text: `Swap`, callback_data: `cc` },
      // { text: `Limit`, callback_data: `Limit_Sell` },
      // { text: `DCA`, callback_data: `DCA_Sell` },
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

export const getLimitSellKeyBoard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId)
  console.log("user_cache", user_cache)
  const keyboard = [
    [
      { text: `Swap`, callback_data: `Swap_Sell` },
      { text: `✅ Limit`, callback_data: `Limit_Sell` },
      { text: `DCA`, callback_data: `DCA_Sell` },
    ],
    [
      { text: `${user_cache.activeSellLimitAmount === 5 ? '✅' : ''}5%`, callback_data: `LimitSell_5` },
      { text: `${user_cache.activeSellLimitAmount === 10 ? '✅' : ''}10%`, callback_data: `LimitSell_10` },
      { text: `${user_cache.activeSellLimitAmount === 20 ? '✅' : ''}20%`, callback_data: `LimitSell_20` },
    ],
    [      
      { text: `${user_cache.activeSellLimitAmount === 50 ? '✅' : ''}50%`, callback_data: `LimitSell_50` },
      { text: `${user_cache.activeSellLimitAmount === 100 ? '✅' : ''}100%`, callback_data: `LimitSell_100` },
      { 
        text: `${user_cache.activeSellLimitAmount && ![5, 10, 20, 50, 100].includes(user_cache.activeSellLimitAmount) ? '✅' + user_cache.activeSellLimitAmount : 'X'} %`, 
        callback_data: `LimitSell_X` 
      },
    ],
    [
      { text: `Trigger Price: ${user_cache.activeSellLimitPrice ? user_cache.activeSellLimitPrice : `-`}$`, callback_data: `LimitSell_Price` },
    ],
    [
      { text: `Expiry: ${user_cache.activeSellLimitDuration ? user_cache.activeSellLimitDuration : `-`}`, callback_data: `LimitSell_Expiry` },
    ],
    [
      { text: `Interval: ${user_cache.activeSellInterval ? user_cache.activeSellInterval : `-`}`, callback_data: `LimitSell_Interval` },
    ],
    [
      { text: `Create Order`, callback_data: `LimitSell_Create_Order` },
    ],
  ]
  return keyboard;
}

export const getDCASellKeyBoard = async (userId: string) => {
  console.log("calling getDCASellKeyBoard...")
  const user_cache = await getUserCacheById(userId)
  console.log("getDCASellKeyBoard user_cache", user_cache)
  const keyboard = [
    [
      { text: `Swap`, callback_data: `Swap_Sell` },
      { text: `Limit`, callback_data: `Limit_Sell` },
      { text: `✅ DCA`, callback_data: `DCA_Sell` },
    ],
    [
      { text: `===== Sell Amount(%) ======`, callback_data: 'cc' },
    ],
    [
      { text: `${user_cache.activeDCASellAmount === 5 ? '✅' : ''}5%`, callback_data: `DCASellAmount_5` },
      { text: `${user_cache.activeDCASellAmount === 10 ? '✅' : ''}10%`, callback_data: `DCASellAmount_10` },
      { text: `${user_cache.activeDCASellAmount === 20 ? '✅' : ''}20%`, callback_data: `DCASellAmount_20` },
    ],
    [
      { text: `${user_cache.activeDCASellAmount === 50 ? '✅' : ''}50%`, callback_data: `DCASellAmount_50` },
      { text: `${user_cache.activeDCASellAmount === 100 ? '✅' : ''}100%`, callback_data: `DCASellAmount_100` },
      { 
        text: `${user_cache.activeDCASellAmount && ![5, 10, 20, 50, 100].includes(user_cache.activeDCASellAmount) ? '✅' + user_cache.activeDCASellAmount : 'X'} %`, 
        callback_data: `DCASell_X` 
      },
    ],
    // [
    //   { text: `Trigger Price: ${user_cache.activeSellDCAPrice ? user_cache.activeSellDCAPrice : `-`}%`, callback_data: `DCASell_Price` },
    // ],
    [
      { text: `===== No of Orders ======`, callback_data: 'cc' },
    ],
    [
      { text: `${user_cache.activeDCASellOrderNum === 10 ? '✅' : ''}10`, callback_data: "DCASellOrderNum_10" },
      { text: `${user_cache.activeDCASellOrderNum === 100 ? '✅' : ''}100`, callback_data: "DCASellOrderNum_100" },
      { text: `${user_cache.activeDCASellOrderNum === 500 ? '✅' : ''}500`, callback_data: "DCASellOrderNum_500" },
      { text: `${user_cache.activeDCASellOrderNum === 1000 ? '✅' : ''}1000`, callback_data: "DCASellOrderNum_1000" },
      { 
        text: `${user_cache.activeDCASellOrderNum && ![10, 100, 500, 1000].includes(user_cache.activeDCASellOrderNum) ? '✅' + user_cache.activeDCASellOrderNum : 'X'}`, 
        callback_data: `DCASell_OrderNum_X`
      },
    ],
    [
      { text: `===== Duration ======`, callback_data: 'cc' },
    ],
    [
      { text: `${user_cache.activeDCASellDuration === 0.1 ? '✅' : ''}0.1h`, callback_data: "DCASellDuration_0.1" },
      { text: `${user_cache.activeDCASellDuration === 1 ? '✅' : ''}1h`, callback_data: "DCASellDuration_1" },
      { text: `${user_cache.activeDCASellDuration === 4 ? '✅' : ''}4h`, callback_data: "DCASellDuration_4" },
      { text: `${user_cache.activeDCASellDuration === 8 ? '✅' : ''}8h`, callback_data: "DCASellDuration_8" },
      { text: `${user_cache.activeDCASellDuration === 24 ? '✅' : ''}24h`, callback_data: "DCASellDuration_24" },
      { 
        text: `${user_cache.activeDCASellDuration && ![0.1, 1, 4, 8, 24].includes(user_cache.activeDCASellDuration) ? '✅' + user_cache.activeDCASellDuration : 'X'}h`, 
        callback_data: `DCASell_Duration_X`
      },
    ],
    [
      { text: `Create Order`, callback_data: `DCASell_Create_Order` },
    ],
  ]
  return keyboard;
}