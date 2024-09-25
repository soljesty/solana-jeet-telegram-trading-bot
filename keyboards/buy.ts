import { UserCache } from "../config";
import { getUserCacheById } from "../controllers/user";

export const getSwapBuyKeyBoard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId);
  const keyboard = [
    [
      { text: `Swap`, callback_data: `cc` },
    ],
    [
      {
        text: `${
          user_cache.activeBuySwapSolAmount === 0.001 ? "✅" : ""
        }0.001 SOL`,
        callback_data: `SwapBuy_0.001`,
      },
      {
        text: `${user_cache.activeBuySwapSolAmount === 1 ? "✅" : ""}1 SOL`,
        callback_data: `SwapBuy_1`,
      },
      {
        text: `${user_cache.activeBuySwapSolAmount === 3 ? "✅" : ""}3 SOL`,
        callback_data: `SwapBuy_3`,
      },
    ],
    [
      {
        text: `${user_cache.activeBuySwapSolAmount === 5 ? "✅" : ""}5 SOL`,
        callback_data: `SwapBuy_5`,
      },
      {
        text: `${user_cache.activeBuySwapSolAmount === 10 ? "✅" : ""}10 SOL`,
        callback_data: `SwapBuy_10`,
      },
      {
        text: `${
          user_cache.activeBuySwapSolAmount &&
          ![0.001, 1, 3, 5, 10].includes(user_cache.activeBuySwapSolAmount)
            ? "✅" + user_cache.activeBuySwapSolAmount
            : "X"
        } SOL`,
        callback_data: `SWAP_BUY_X`,
      },
    ],
    [{ text: `Buy`, callback_data: `Swap_Buy_Action` }],
  ];
  return keyboard;
};

export const getLimitBuyKeyBoard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId);
  console.log("user_cache", user_cache);
  const keyboard = [
    [
      { text: `Swap`, callback_data: `Swap_Buy` },
      { text: `✅ Limit`, callback_data: `Limit_Buy` },
      { text: `DCA`, callback_data: `DCA_Buy` },
    ],
    [
      {
        text: `${
          user_cache.activeBuyLimitSolAmount === 0.001 ? "✅" : ""
        }0.001 SOL`,
        callback_data: `LimitBuy_0.001`,
      },
      {
        text: `${user_cache.activeBuyLimitSolAmount === 1 ? "✅" : ""}1 SOL`,
        callback_data: `LimitBuy_1`,
      },
      {
        text: `${user_cache.activeBuyLimitSolAmount === 3 ? "✅" : ""}3 SOL`,
        callback_data: `LimitBuy_3`,
      },
    ],
    [
      {
        text: `${user_cache.activeBuyLimitSolAmount === 5 ? "✅" : ""}5 SOL`,
        callback_data: `LimitBuy_5`,
      },
      {
        text: `${user_cache.activeBuyLimitSolAmount === 10 ? "✅" : ""}10 SOL`,
        callback_data: `LimitBuy_10`,
      },
      {
        text: `${
          user_cache.activeBuyLimitSolAmount &&
          ![0.001, 1, 3, 5, 10].includes(user_cache.activeBuyLimitSolAmount)
            ? "✅" + user_cache.activeBuyLimitSolAmount
            : "X"
        } SOL`,
        callback_data: `LimitBuy_X`,
      },
    ],
    [
      {
        text: `Trigger Price: ${
          user_cache.activeBuyLimitPrice ? user_cache.activeBuyLimitPrice : `-`
        } SOL`,
        callback_data: `LimitBuy_Price`,
      },
    ],
    [
      {
        text: `Expiry: ${
          user_cache.activeBuyLimitDuration
            ? user_cache.activeBuyLimitDuration
            : `-`
        }`,
        callback_data: `LimitBuy_Expiry`,
      },
    ],
    [
      {
        text: `Interval: ${
          user_cache.activeBuyInterval ? user_cache.activeBuyInterval : `-`
        }`,
        callback_data: `LimitBuy_Interval`,
      },
    ],
    [{ text: `Create Order`, callback_data: `LimitBuy_Create_Order` }],
  ];
  return keyboard;
};

// get dca buy keyboard
export const getDCABuyKeyBoard = async (userId: string) => {
  console.log("calling getDCABuyKeyBoard...");
  const user_cache = await getUserCacheById(userId);
  console.log("getDCABuyKeyBoard user_cache", user_cache);
  const keyboard = [
    [
      { text: `Swap`, callback_data: `Swap_Buy` },
      { text: `Limit`, callback_data: `Limit_Buy` },
      { text: `✅ DCA`, callback_data: `DCA_Buy` },
    ],
    [{ text: `===== Sol Amount ======`, callback_data: "cc" }],
    [
      {
        text: `${
          user_cache.activeBuyDCASolAmount === 0.01 ? "✅" : ""
        }0.01 SOL`,
        callback_data: `DCABuy_0.01`,
      },
      {
        text: `${user_cache.activeBuyDCASolAmount === 0.1 ? "✅" : ""}0.1 SOL`,
        callback_data: `DCABuy_0.1`,
      },
      {
        text: `${user_cache.activeBuyDCASolAmount === 3 ? "✅" : ""}3 SOL`,
        callback_data: `DCABuy_3`,
      },
    ],
    [
      {
        text: `${user_cache.activeBuyDCASolAmount === 5 ? "✅" : ""}5 SOL`,
        callback_data: `DCABuy_5`,
      },
      {
        text: `${user_cache.activeBuyDCASolAmount === 10 ? "✅" : ""}10 SOL`,
        callback_data: `DCABuy_10`,
      },
      {
        text: `${
          user_cache.activeBuyDCASolAmount &&
          ![0.01, 1, 3, 5, 10].includes(user_cache.activeBuyDCASolAmount)
            ? "✅" + user_cache.activeBuyDCASolAmount
            : "X"
        } SOL`,
        callback_data: `DCABuy_X`,
      },
    ],
    [{ text: `===== No of Orders ======`, callback_data: "cc" }],
    [
      {
        text: `${user_cache.activeBuyDCAOrderNum === 10 ? "✅" : ""}10`,
        callback_data: "DCABuy_Order_10",
      },
      {
        text: `${user_cache.activeBuyDCAOrderNum === 100 ? "✅" : ""}100`,
        callback_data: "DCABuy_Order_100",
      },
      {
        text: `${user_cache.activeBuyDCAOrderNum === 500 ? "✅" : ""}500`,
        callback_data: "DCABuy_Order_500",
      },
      {
        text: `${user_cache.activeBuyDCAOrderNum === 1000 ? "✅" : ""}1000`,
        callback_data: "DCABuy_Order_1000",
      },
      {
        text: `${
          user_cache.activeBuyDCAOrderNum &&
          ![10, 100, 500, 1000].includes(user_cache.activeBuyDCAOrderNum)
            ? "✅" + user_cache.activeBuyDCAOrderNum
            : "X"
        }`,
        callback_data: `DCABuy_Order_X`,
      },
    ],
    [{ text: `===== Duration ======`, callback_data: "cc" }],
    [
      {
        text: `${user_cache.activeBuyDCADuration === 0.1 ? "✅" : ""}0.1h`,
        callback_data: "DCADuration_0.1h",
      },
      {
        text: `${user_cache.activeBuyDCADuration === 1 ? "✅" : ""}1h`,
        callback_data: "DCADuration_1h",
      }, // in se
      {
        text: `${user_cache.activeBuyDCADuration === 4 ? "✅" : ""}4h`,
        callback_data: "DCADuration_4h",
      },
      {
        text: `${user_cache.activeBuyDCADuration === 8 ? "✅" : ""}8h`,
        callback_data: "DCADuration_8h",
      },
      {
        text: `${user_cache.activeBuyDCADuration === 24 ? "✅" : ""}24h`,
        callback_data: "DCADuration_24h",
      },
      {
        text: `${
          user_cache.activeBuyDCADuration &&
          ![0.1, 1, 4, 8, 24].includes(user_cache.activeBuyDCADuration)
            ? "✅" + user_cache.activeBuyDCADuration
            : "X"
        } h`,
        callback_data: `DCADuration_Xh`,
      },
    ],
    [{ text: `Create Order`, callback_data: `DCABuy_Create_Order` }],
  ];
  return keyboard;
};

export const settingsKeyboard = async () => {

}

export const getWalletsKeyboard = async () => {  
}