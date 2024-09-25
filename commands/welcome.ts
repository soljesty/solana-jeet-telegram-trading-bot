import { Keypair } from "@solana/web3.js"
import { BOT_NAME } from "../config"

export const welcome = async (walletAddr: string) => {
  console.log("callling welcome====>")
  console.log("walletAddr", walletAddr)
  const keyPair = Keypair.generate()
  const title = `
<b> Welcome to ${BOT_NAME} </b>
Solana’s fastest bot to trade any coin (SPL token), built by the ${BOT_NAME} community! 

You currently have no SOL in your wallet. To start trading, deposit SOL to your ${BOT_NAME}t wallet address:

<code>${walletAddr} </code>(tap to copy)

Once done, tap refresh and your balance will appear here.

To buy a token enter a ticker, token address, or a URL from pump.fun, Birdeye, Dexscreener or Meteora.

For more info on your wallet and to retrieve your private key, tap the wallet button below. User funds are safe on ${BOT_NAME}, but if you expose your private key we can't protect you!
  `

  const content = [
    [
      { text: 'Buy', callback_data: 'Buy' },
      { text: 'Sell', callback_data: 'Sell' },
    ],
    // [
    //   { text: 'Limit Orders', callback_data: 'Limit_Orders' },
    //   { text: 'TWAP(DCA Orders)', callback_data: 'DCA_Orders' },
    //   { text: 'Snipe', callback_data: 'Snipe' },
    // ],
    // [
    //   { text: 'Help', callback_data: 'Help' },
    //   { text: 'Refer friends', callback_data: 'ReferFriends' },
    //   { text: 'Alerts', callback_data: 'Alerts' },
    // ],
    [
      { text: 'Wallet', callback_data: 'Wallet' },
      { text: 'Settings', callback_data: 'Setting_Dashboard' },
    ],
    [
      { text: 'Pin', callback_data: 'Pin' },
      { text: 'Refresh', callback_data: 'Refresh' },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ]
  ]


  return {
    title, content
  }
}
