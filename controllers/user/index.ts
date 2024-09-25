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

export const updateUser = async (userId: string, data: any) => {
  console.log("calling updateUser...")
  console.log("userId", userId)
  console.log("data", data)
  try {
    if (userId) {
      // Use findOneAndUpdate with upsert option
      const res = await UserModel.findOneAndUpdate(
        { userId: userId },
        {
          $set: data
        },
        { upsert: true, new: true }
      );
    } else {

    }
  } catch (error: any) {
    console.error(error);
  }
}

export const addNewWallet = async (userId: string, walletAddress: string) => {
  console.log("calling updateUser...")
  console.log("userId", userId)
  console.log("walletAddress", walletAddress)
  try {
    if (userId) {
      // Use findOneAndUpdate with upsert option
      const res = await UserModel.findOneAndUpdate(
        { userId: userId },
        {
          // Use $addToSet to add a wallet address without duplicates
          $addToSet: { walletAddress: walletAddress },
        },
        { upsert: true, new: true }
      );
      if (res) {
        return {
          success: true
        }
      } else {
        return {
          success: false
        }
      }
    } else {
      return {
        success: false
      }
    }
  } catch (error: any) {
    console.error(error);
  }
}

export const verify = async (msg: Message) => {
  return await verifyUser(msg.chat.id.toString(), {
    name: msg.chat.first_name,
    username: msg.chat.username
  })
}

export const verifyUser = async (userId: string, data?: any) => {
  console.log("calling verifyUser...")
  const user = await UserModel.findOne({
    userId,
  });
  if (user) {
    console.log("user is existing")
    if (user.isVerified) {
      return true;
    } else {
      return false;
    }
  } else {
    console.log("user is not registered")
    const keyPair = Keypair.generate()
    const _data = {
      ...data,
      walletAddress: [base58.encode(keyPair.secretKey).toString()]
    }
    console.log("_data", _data)
    await updateUser(userId, _data)
    await updateData(userId, {
      activeWallet: 0
    })
    return false;
  }
}

export const getUser = async (userId: string) => {
  try {
    const user = await UserModel.findOne({ userId });
    if (!user) {
      console.log('User not found');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserSecretKey = async (userId: string) => {
  try {
    const user: any = await UserModel.findOne({ userId });
    const activeWallet: number = await getActiveWallet(userId)
    if (!user) {
      console.log('User not found');
      return null;
    }
    return user.walletAddress[activeWallet];
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const getUserPubKey = async (userId: string) => {
  console.log("calling getUserPubKey...")
  try {
    const user: any = await UserModel.findOne({ userId });
    const activeWallet: number = await getActiveWallet(userId)

    if (!user) {
      console.log('User not found');
      return null;
    }
    if (user.walletAddress.length > 0) {
      const pubKey = Keypair.fromSecretKey(base58.decode(user.walletAddress[activeWallet])).publicKey.toBase58();

      return pubKey;
    } else {
      console.log("!user.walletAddress", user.walletAddress)
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};




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

export const getLimitOrdersByUserId = async (userId: string) => {
  const limits = await LimitOrderModel.find({ userId })
  console.log("limits", limits)
  return limits;
}

export const getDCAOrdersByUserId = async (userId: string) => {
  const dcas = await DCAOrderModel.find({ userId: userId, expiredAt: { $gt: Date.now() } })
  console.log("dcas", dcas)
  return dcas;
}

export const getWalletsByUserId = async (userId: string) => {
  const user: any = await UserModel.findOne({ userId });
  return user.walletAddress
}

export const closeAllLimitOrders = async (userId: string): Promise<boolean> => {
  try {
    const result = await LimitOrderModel.deleteMany({ userId });
    if (result) {
      console.log(`Deleted ${result.deletedCount} documents.`);
      return true;
    } else {
      return false
    }
  } catch (error) {
    console.error('Error deleting documents:', error);
    return false;
  }
};