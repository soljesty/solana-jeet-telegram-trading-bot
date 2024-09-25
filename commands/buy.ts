import { BOT_NAME } from "../config"
import { getSwapBuyKeyBoard } from "../keyboards/buy"
import { getTokenAccountBalance } from "../utils"
import { getTokenData } from "../utils/token"

import { Token } from "../utils/types"

export const generateSwapBuyCommands = async (param: Token, userId: string) => {

  const buy_content = await getSwapBuyKeyBoard(userId);
  const tokenMetadata = await getTokenData(param.baseMint)
  // Share token with your Reflink (https://t.me/solana_trojanbot?start=r-misterrust77-43uhykFm8Y9gLvHrWs7r7w1HCKu6vikDi7j394FaSfNz)

  // Mint Authority Enabled ⚠️ Learn more (https://docs.bonkbot.io/safety-when-trading/mint-authority)
  // Freeze Authority Enabled ⚠️ Learn more (https://docs.bonkbot.io/safety-when-trading/freeze-authority)

  // 5m: NaN%, 1h: NaN%, 6h: NaN%, 24h: NaN%
  // Market Cap: $N/A

  // (https://dexscreener.com/solana/${param.poolId.toBase58()}) ${}
  const buy_title = `
BUY $${tokenMetadata.symbol}(${tokenMetadata.name}) 📈 

<code>${param.baseMint}</code>


WARNING: No route found. ${BOT_NAME} instant swap is currently only available for -SOL pairs on Raydium, pump.fun, Meteora, Moonshot, or Jupiter. Please try again later.

Wallet Balance: ${param.balance}
To buy press one of the buttons below.
  `
  return {
    buy_title, buy_content
  }
}

export const generateTwapBuyCommands = async (param: Token) => {

  const buy_content = [
    [
      { text: 'Swap', callback_data: 'BUY_0.005' },
      { text: 'Limit', callback_data: 'BUY_1' },
      { text: '✅DCA', callback_data: 'BUY_3' },
    ],
    [
      { text: '0.005 SOL', callback_data: 'BUY_0.005' },
      { text: '1 SOL', callback_data: 'BUY_1' },
      { text: '3 SOL', callback_data: 'BUY_3' },
    ],
    [
      { text: '5 SOL', callback_data: 'BUY_5' },
      { text: '10 SOL', callback_data: 'BUY_10' },
      { text: 'X SOL', callback_data: 'BUY_X' },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ],
  ]
  const tokenMetadata = await getTokenData(param.baseMint)
  
  const buy_title = `
BUY $${tokenMetadata.symbol}(${tokenMetadata.name}) 📈)
${param.baseMint}


WARNING: No route found. ${BOT_NAME} instant swap is currently only available for -SOL pairs on Raydium, pump.fun, Meteora, Moonshot, or Jupiter. Please try again later.

Wallet Balance: ${param.balance}
To buy press one of the buttons below.
  `
  return {
    buy_title, buy_content
  }
}