import { Keypair, PublicKey } from "@solana/web3.js"
import LimitOrderModal from "../../models/LimitOrderModal"
import DCAOrderModel from "../../models/TwapModel"
import { dcaOrder, dcaSellOrder } from "../../utils/trade"
import { AssetUploadFailedError } from "@metaplex-foundation/js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { solConnection } from "../../config"
import base58 from 'bs58'
export const createLimitBuyOrder = async (
  data: any
) => {
  try {
    // Use findOneAndUpdate with upsert option
    const res = await LimitOrderModal.create(data)
    if (res) {
      return {
        result: "success"
      }
    } else {
      return {
        result: "fail"
      }
    }

  } catch (error: any) {
    console.error(error);
    return {
      result: "fail"
    }
  }
}

export const createDCAOrder = async (
  data: any
) => {
  try {
    // Use findOneAndUpdate with upsert option
    const res = await DCAOrderModel.create(data)
    if (res) {
      return {
        result: "success"
      }
    } else {
      return {
        result: "fail"
      }
    }
  } catch (error: any) {
    console.error(error);
    return {
      result: "fail"
    }
  }
}

export const runDCAOrders = async () => {
  console.log("calling runDCAOrders...")
  const liveOrders = await DCAOrderModel.find({
    expiredAt: { $gt: Date.now() }
  });

  console.log("liveOrders", liveOrders)

  // Run all the DCA orders in parallel using Promise.all
  const orderPromises = await Promise.all(
    liveOrders.map(async (order) => {
      if (order.type === "Buy") {
        return dcaOrder(
          order.angelSecret,
          new PublicKey(order.tokenMint),
          // new PublicKey(order.poolId),
          order.solAmount / order.orderNum,
          order.expiredAt,
          (order.duration * 3600 * 1000) / order.orderNum
        );
      } else if (order.type === "Sell") {
        const tokenAta = await getAssociatedTokenAddress(
          new PublicKey(order.tokenMint),
          Keypair.fromSecretKey(base58.decode(order.angelSecret)).publicKey
        );
        const tokenBal = await solConnection.getTokenAccountBalance(tokenAta);
        if (tokenBal.value.uiAmount) {
          return dcaSellOrder(
            order.angelSecret,
            new PublicKey(order.tokenMint),
            // new PublicKey(order.poolId),
            (order.solAmount / order.orderNum / 100) * tokenBal.value.uiAmount,
            order.expiredAt,
            (order.duration * 3600 * 1000) / order.orderNum
          );
        } else {
          return null; // Return null or handle the scenario when there's no balance
        }
      }
    })
  );

  // Now you can work with orderPromises, which is an array of Promises

  // Wait for all promises to resolve
  await Promise.all(orderPromises);
};

// export const removeAll