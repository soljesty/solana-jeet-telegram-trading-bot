import { getUserCacheById } from "../controllers/user";
import { isVariableExisting } from "../utils";

// get settings keyboard
export const getSettingKeyboard = async (userId: string) => {
  const user_cache: any = await getUserCacheById(userId);
  const keyboard = [
    [
      {
        text: `===== SLIPPAGE =====`,
        callback_data: "cc",
      },
    ],
    [
      {
        text: `✏️ Buy ${
          isVariableExisting(user_cache, "buySlippage")
            ? user_cache.buySlippage
            : "-"
        } %`,
        callback_data: `Buy_Slippage`,
      },
      {
        text: `✏️ Sell ${
          isVariableExisting(user_cache, "sellSlippage") ? user_cache.sellSlippage : "-"
        } %`,
        callback_data: `Sell_Slippage`,
      },
    ],
  ];
  return keyboard;
};
