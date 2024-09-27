import { Keypair, PublicKey } from "@solana/web3.js";
import UserModel from "../../models/UserModel";
import TelegramBot, { Message } from 'node-telegram-bot-api';
import base58 from 'bs58'

import { buy, buyWithJupiter, sell, sellWithJupiter } from "../../utils/trade";
import { getActiveWallet, getTokenAccountBalance, readDataJson, updateData } from "../../utils";
import { solConnection, UserCache } from "../../config";
import { IUserCache } from "../../utils/types";
import LimitOrderModel from "../../models/LimitOrderModal";
import DCAOrderModel from "../../models/TwapModel";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { publicKey } from "@raydium-io/raydium-sdk";

export const getUserCacheById = async (userId: string) => {
  const data: any = await readDataJson()
  return data[userId]
}

export const buyAmount = async (buyAmount: number, userId: string, kp: Keypair, isAmountSpecific?: boolean) => {
  const userCache: IUserCache = await getUserCacheById(userId)
  return await buyWithJupiter(
    kp,
    // new PublicKey(userCache.activeBuyPoolId),
    new PublicKey(userCache.activeBuyMint),
    buyAmount
  )
}

export const sellAmount = async (sellPercent: number, userId: string, kp: Keypair, isAmountSpecific?: boolean) => {
  const userCache: IUserCache = await getUserCacheById(userId)
  // const tokenBalance = await getTokenAccountBalance(solConnection, kp.publicKey.toBase58(), userCache.activeSellMint)


  const tokenAta = await getAssociatedTokenAddress(new PublicKey(userCache.activeSellMint), kp.publicKey)
  const tokenBal = await solConnection.getTokenAccountBalance(tokenAta)

  if (!tokenBal) return;
  if (!tokenBal.value.uiAmount) return;
  return await sellWithJupiter(
    kp,
    // new PublicKey(userCache.activeSellPoolId),
    new PublicKey(userCache.activeSellMint),
    sellPercent / 100 * tokenBal.value.uiAmount
  )
}
