import { getUserCacheById } from "../controllers/user";
export const getWalletAddressKeyboard = async () => {
  const keyboard = [
    [
      { text: `✅ Swap`, callback_data: `Swap_Buy` },
      { text: `Limit`, callback_data: `Limit_Buy` },
      { text: `DCA`, callback_data: `DCA_Buy` },
    ],
    [
      { text: `0.001 SOL`, callback_data: `BUY_0.001` },
      { text: `1 SOL`, callback_data: `BUY_1` },
      { text: `3 SOL`, callback_data: `BUY_3` },
    ],
    [
      { text: `5 SOL`, callback_data: `BUY_5` },
      { text: `10 SOL`, callback_data: `BUY_10` },
      { text: `X SOL`, callback_data: `BUY_X` },
    ],
    [
      { text: `Buy`, callback_data: `Buy` },
    ],
  ]
  return keyboard;
}

export const getWalletWithdrawKeyboard = async (userId: string) => {
  const user_cache = await getUserCacheById(userId)
  const keyboard = [
    [
      { text: `${user_cache.activeWithdrawAmount === 50 ? '✅' : ''}5%`, callback_data: `Withdraw_50` },
      { text: `${user_cache.activeWithdrawAmount === 100 ? '✅' : ''}10%`, callback_data: `Withdraw_100` },
      { 
        text: `${user_cache.activeWithdrawAmount && ![50, 100].includes(user_cache.activeWithdrawAmount) ? '✅' + user_cache.activeWithdrawAmount : 'X'} %`, 
        callback_data: `Withdraw_X` 
      },
    ],
    [
      { text: `${user_cache.activeWithdrawAddress ? '✅ To: ' + user_cache.activeWithdrawAddress : 'Set Withdraw Address'}`, callback_data: `Set_Withdraw_Address` },
    ],
    [
      { text: `Withdraw`, callback_data: `Withdraw_Action` },
    ],
  ]
  return keyboard;
}