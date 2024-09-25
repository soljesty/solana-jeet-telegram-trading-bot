import { PublicKey } from "@solana/web3.js"
import LimitOrderModal from "../../models/LimitOrderModal"
import DCAOrderModel from "../../models/TwapModel"
import { dcaOrder } from "../../utils/trade"
import { AssetUploadFailedError } from "@metaplex-foundation/js"

export const createLimitSellOrder = async (
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
