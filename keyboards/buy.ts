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
