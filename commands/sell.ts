import { BOT_NAME } from "../config";
import { getSwapSellKeyBoard } from "../keyboards/sell";
import { getTokenAccountBalance } from "../utils"
import { getTokenData } from "../utils/token"
import { Token } from "../utils/types"



export const generateSwapSellCommands = async (param: Token, userId: string) => {

  const sell_content = await getSwapSellKeyBoard(userId);
  const tokenMetadata = await getTokenData(param.baseMint)
  // Share token with your Reflink (https://t.me/solana_trojanbot?start=r-misterrust77-43uhykFm8Y9gLvHrWs7r7w1HCKu6vikDi7j394FaSfNz)

  // Mint Authority Enabled ⚠️ Learn more (https://docs.bonkbot.io/safety-when-trading/mint-authority)
  // Freeze Authority Enabled ⚠️ Learn more (https://docs.bonkbot.io/safety-when-trading/freeze-authority)

  // 5m: NaN%, 1h: NaN%, 6h: NaN%, 24h: NaN%
  // Market Cap: $N/A

  
  // (https://dexscreener.com/solana/${param.poolId.toBase58()})
  const sell_title = `
SELL $${tokenMetadata.symbol}(${tokenMetadata.name}) 📈 
<code>${param.baseMint}</code>


WARNING: No route found. ${BOT_NAME} instant swap is currently only available for -SOL pairs on Raydium, pump.fun, Meteora, Moonshot, or Jupiter. Please try again later.

Wallet Balance: ${param.balance}
To sell press one of the buttons below.
  `
  return {
    sell_title, sell_content
  }
}