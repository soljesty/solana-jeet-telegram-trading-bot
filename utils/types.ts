import { PublicKey } from "@solana/web3.js";

export interface Token{
  poolId?: PublicKey;
  baseMint: string;
  balance: number;
}

export interface IUserCache{
  activeBuyMint: string;
  activeBuyPoolId: string;
  activeSellMint: string;
  activeSellPoolId: string;
}

export interface TokenMetadata{
  name: string;
  symbol: string;
  uri?: string
}