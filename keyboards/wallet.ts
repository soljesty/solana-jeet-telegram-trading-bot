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