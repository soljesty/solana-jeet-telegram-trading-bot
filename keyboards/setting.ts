import { getUserCacheById } from "../controllers/user";

// get settings keyboard
export const getSettingKeyboard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId)
  const keyboard = [
    [
      {
        text: `===== AUTO BUY =====`, callback_data: 'cc'
      }
    ],
    [
      {
        text: `${user_cache.isAutoBuyEnabled ? '🟢' : '🔴'} Enabled`, callback_data: `${user_cache.isAutoBuyEnabled ? 'Auto_Buy_Enable' : 'Auto_Buy_Unable'}`
      },
      {
        text: `✏️ ${user_cache.autoBuyAmount ? user_cache.autoBuyAmount : 0.01} SOL`, callback_data: `AutoBuy_Amount`
      },
    ],
    [
      {
        text: `===== SLIPPAGE =====`, callback_data: 'cc'
      }
    ],
    [
      {
        text: `✏️ Buy ${user_cache.buySlippage ? user_cache.buySlippage : '-'} %`, callback_data: `Buy_Slippage`
      },
      {
        text: `✏️ Sell ${user_cache.sellSlippage ? user_cache.sellSlippage : '-'} %`, callback_data: `Sell_Slippage`
      },
    ],
    [
      {
        text: `===== SNIPE TRADE AMOUNT =====`, callback_data: 'cc'
      }
    ],
    [
      {
        text: `✏️ ${user_cache.snipeAmount ? user_cache.snipeAmount : '-'}`, callback_data: `Set_SnipeAmount`
      }
    ],
  ]
  return keyboard;
}