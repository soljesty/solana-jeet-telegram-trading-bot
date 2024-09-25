// @ts-ignore
import { Liquidity, MARKET_STATE_LAYOUT_V3 } from "@raydium-io/raydium-sdk";
import { NATIVE_MINT, TransferFeeAmountLayout } from "@solana/spl-token";
import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { solConnection } from "../config";

export class PoolKeys {
  static SOLANA_ADDRESS = 'So11111111111111111111111111111111111111112'
  static RAYDIUM_POOL_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
  static OPENBOOK_ADDRESS = 'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX';
  static SOL_DECIMALS = 9

  static async fetchMarketId(connection: Connection, baseMint: PublicKey, quoteMint: PublicKey, commitment: Commitment) {
    console.log("calling fetchMarketId")
    const accounts = await connection.getProgramAccounts(
      new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
      {
        commitment,
        filters: [
          { dataSize: MARKET_STATE_LAYOUT_V3.span },
          {
            memcmp: {
              offset: MARKET_STATE_LAYOUT_V3.offsetOf("baseMint"),
              bytes: baseMint.toBase58(),
            },
          },
          {
            memcmp: {
              offset: MARKET_STATE_LAYOUT_V3.offsetOf("quoteMint"),
              bytes: quoteMint.toBase58(),
            },
          },
        ],
      }
    );
    console.log("Acctouns", accounts)
    return accounts.map(({ account }) => MARKET_STATE_LAYOUT_V3.decode(account.data))[0].ownAddress
  }

  static async fetchMarketInfo(connection: Connection, marketId: PublicKey) {
    const marketAccountInfo = await connection.getAccountInfo(marketId, "processed");
    if (!marketAccountInfo) {
      throw new Error('Failed to fetch market info for market id ' + marketId.toBase58());
    }

    return MARKET_STATE_LAYOUT_V3.decode(marketAccountInfo.data);
  }

  static async generateV4PoolInfo(baseMint: PublicKey, quoteMint: PublicKey, marketID: PublicKey) {
    const poolInfo = Liquidity.getAssociatedPoolKeys({
      version: 4,
      marketVersion: 3,
      baseMint: baseMint,
      quoteMint: quoteMint,
      baseDecimals: 0,
      quoteDecimals: this.SOL_DECIMALS,
      programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
      marketId: marketID,
      marketProgramId: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
    });

    return { poolInfo }
  }

  static async fetchPoolKeyInfo(connection: Connection, baseMint: PublicKey, quoteMint: PublicKey): Promise<any> {
    console.log("calling fetchPoolKeyInfo...")
    const marketId = await this.fetchMarketId(connection, baseMint, quoteMint, 'confirmed')
    console.log("marketId", marketId)
    const V4PoolInfo = await this.generateV4PoolInfo(baseMint, quoteMint, marketId)
    // const lpMintInfo = await connection.getParsedAccountInfo(V4PoolInfo.poolInfo.lpMint, "confirmed") as MintInfo;
    console.log("V4PoolInfo", V4PoolInfo)
    return V4PoolInfo.poolInfo.id
  }
}

interface MintInfo {
  value: {
    data: {
      parsed: {
        info: {
          decimals: number
        }
      }
    }
  }
}

export const getPoolIdFromChain = async (baseMint: PublicKey): Promise<any> => {
  console.log("🚀 ~ getLpMintAndPairId ~ baseMint:", baseMint.toBase58())
  const poolInfo = await PoolKeys.fetchPoolKeyInfo(solConnection, baseMint, NATIVE_MINT)
  console.log("poolInfo", poolInfo)
  return poolInfo
}


type DexScreenerResponse = {
  pairs: {
    dexId: string;
    pairAddress: string;
  }[];
};

export const getPoolIdFromDexScreener = async (baseMint: PublicKey): Promise<PublicKey | null> => {
  console.log("calling getLpMintAndPairId...", baseMint.toBase58());
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${baseMint.toBase58()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // @ts-ignore
    const data: DexScreenerResponse = await res.json();

    console.log("data.pairs", data.pairs)
    const filteredPairs = data.pairs.filter((pair: any) => pair.quoteToken.symbol === 'SOL');

    if (data.pairs.length === 0) {
      console.log("no pair")
      return null;
    } else {
      const raydiumPair = filteredPairs.find(pair => pair.dexId === "raydium");
      const orcaPair = filteredPairs.find(pair => pair.dexId === "orca");
      const meteoraPair = filteredPairs.find(pair => pair.dexId === "meteora");
      console.log("raydiumPair", raydiumPair)
      console.log("orcaPair", orcaPair)
      console.log("meteoraPair", meteoraPair)
      if (raydiumPair) {
        return new PublicKey(raydiumPair.pairAddress);
      } else {
        return null;
      }
    }
  } catch (e) {
    console.log("error in fetching price of pool", e);
    return null;
  }
};
