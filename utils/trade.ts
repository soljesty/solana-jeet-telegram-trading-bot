import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  execute,
  executeVersionedTx,
  getTokenPriceFromDexScreener,
  sendSOL,
  sleep,
} from ".";
import {
  getBuyTx,
  getBuyTxWithJupiter,
  getSellTx,
  getSellTxWithJupiter,
} from "./swapOnlyAmm";
import {
  getAssociatedTokenAddress,
  getMint,
  NATIVE_MINT,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { CLUSTER, connectDb, IS_FEE_SET, solConnection } from "../config";
import base58 from "bs58";
import { getPoolKeys } from "./getPoolInfo";
import { PoolKeys } from "./poolKeys";
import LimitOrderModel from "../models/LimitOrderModal";
const SWAP_ROUTING = true;

export const buy = async (
  newWallet: Keypair,
  poolId: PublicKey,
  baseMint: PublicKey,
  buyAmount: number
) => {
  let solBalance: number = 0;
  try {
    solBalance = await solConnection.getBalance(newWallet.publicKey);
  } catch (error) {
    console.log("Error getting balance of wallet");
    return null;
  }
  if (solBalance == 0) {
    return null;
  }
  try {
    let tx;
    if (SWAP_ROUTING)
      tx = await getBuyTxWithJupiter(newWallet, baseMint, buyAmount);
    else
      tx = await getBuyTx(
        solConnection,
        newWallet,
        baseMint,
        NATIVE_MINT,
        buyAmount,
        poolId.toBase58()
      );
    if (tx == null) {
      console.log(`Error getting buy transaction`);
      return null;
    }
    console.log(await solConnection.simulateTransaction(tx));
    const latestBlockhash = await solConnection.getLatestBlockhash();
    const txSig = await execute(tx, latestBlockhash);
    const tokenBuyTx = txSig ? `https://solscan.io/tx/${txSig}` : "";
    console.log("tokenBuyTx", tokenBuyTx);

    console.log("after buy");

    // executeVer

    return tokenBuyTx;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const buyWithJupiter = async (
  newWallet: Keypair,
  baseMint: PublicKey,
  buyAmount: number
) => {
  let solBalance: number = 0;
  try {
    solBalance = await solConnection.getBalance(newWallet.publicKey);
  } catch (error) {
    console.log("Error getting balance of wallet");
    return null;
  }
  if (solBalance == 0) {
    return null;
  }
  try {
    let tx;
    tx = await getBuyTxWithJupiter(newWallet, baseMint, buyAmount);
    if (tx == null) {
      console.log(`Error getting buy transaction`);
      return null;
    }
    console.log(await solConnection.simulateTransaction(tx));
    const latestBlockhash = await solConnection.getLatestBlockhash();
    const txSig = await execute(tx, latestBlockhash);
    const tokenBuyTx = txSig ? `https://solscan.io/tx/${txSig}` : "";
    console.log("tokenBuyTx", tokenBuyTx);

    return tokenBuyTx;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const sell = async (
  wallet: Keypair,
  poolId: PublicKey,
  baseMint: PublicKey,
  sellAmount: number
) => {
  console.log("calling sell", sellAmount);
  try {
    // const tokenAta = await getAssociatedTokenAddress(baseMint, wallet.publicKey)
    // const tokenBalInfo = await solConnection.getTokenAccountBalance(tokenAta)
    // if (!tokenBalInfo) {
    //   console.log("Balance incorrect")
    //   return null
    // }
    // let tokenBalance = tokenBalInfo.value.amount
    // console.log(tokenBalance)
    // if (isHalfSell)
    //   tokenBalance = new BN(tokenBalInfo.value.amount).div(new BN(2)).toString()

    try {
      let sellTx;
      if (SWAP_ROUTING)
        sellTx = await getSellTxWithJupiter(
          wallet,
          baseMint,
          sellAmount.toString()
        );
      else
        sellTx = await getSellTx(
          solConnection,
          wallet,
          baseMint,
          NATIVE_MINT,
          sellAmount,
          poolId.toBase58()
        );

      if (sellTx == null) {
        console.log(`Error getting sell transaction`);
        return null;
      }
      console.log(await solConnection.simulateTransaction(sellTx));
      const latestBlockhashForSell = await solConnection.getLatestBlockhash();
      const txSellSig = await execute(sellTx, latestBlockhashForSell, false);
      console.log("txSellSig", txSellSig);
      const tokenSellTx = txSellSig ? `https://solscan.io/tx/${txSellSig}` : "";
      // const solBalance = await solConnection.getBalance(wallet.publicKey)
      // editJson({
      //   pubkey: wallet.publicKey.toBase58(),
      //   tokenSellTx,
      //   solBalance
      // })
      return tokenSellTx;
    } catch (error) {
      console.log("1", error);
      return null;
    }
  } catch (error) {
    console.log("2", error);
    return null;
  }
};

export const sellWithJupiter = async (
  wallet: Keypair,
  baseMint: PublicKey,
  sellAmount: number
) => {
  console.log("calling sell", sellAmount);

  try {
    const mintInfo = await getMint(solConnection, baseMint);
    const decimals = mintInfo.decimals;

    let sellTx;
    sellTx = await getSellTxWithJupiter(
      wallet,
      baseMint,
      (sellAmount * 10 ** decimals).toString()
    );

    if (sellTx == null) {
      console.log(`Error getting sell transaction`);
      return null;
    }

    const latestBlockhashForSell = await solConnection.getLatestBlockhash();
    const txSellSig = await execute(sellTx, latestBlockhashForSell, false);
    console.log("txSellSig", txSellSig);
    const tokenSellTx = txSellSig ? `https://solscan.io/tx/${txSellSig}` : "";
    // const solBalance = await solConnection.getBalance(wallet.publicKey)
    // editJson({
    //   pubkey: wallet.publicKey.toBase58(),
    //   tokenSellTx,
    //   solBalance
    // })
    return tokenSellTx;
  } catch (error) {
    console.log("ERROR sellWithJupiter: ", error)
    return null;
  }
};

export const limitBuyOrder = async (
  userId: string,
  secretKey: string,
  baseMint: PublicKey,
  poolId: PublicKey,
  triggerPrice: number,
  buySolAmount: number,
  expiredAt: number,
  buyInterval: number
) => {
  console.log("calling limitBuyOrder");
  const executeOrder = async () => {
    try {
      console.log("current time", Date.now());
      console.log("expired at: ", expiredAt);

      const orders = await LimitOrderModel.find({
        userId: userId,
      });
      if (orders && orders.length === 0) {
        return false;
      }
      if (Date.now() > expiredAt) {
        console.log("Process completed. Stopping now.");
        return false; // Stop the process
      }
      let poolKeys;
      let quoteVault;
      const ADDITIONAL_FEE = 0;

      const mainKp = Keypair.fromSecretKey(base58.decode(secretKey));

      const solBalance =
        (await solConnection.getBalance(mainKp.publicKey)) / LAMPORTS_PER_SOL;

      console.log(`Wallet address: ${mainKp.publicKey.toBase58()}`);
      console.log(`Pool token mint: ${baseMint.toBase58()}`);
      console.log(`Wallet SOL balance: ${solBalance.toFixed(3)}SOL`);
      console.log(`Interval: ${buyInterval}ms`);
      console.log(`Buy amount: ${buySolAmount}ms`);

      console.log("poolId", poolId.toBase58());
      let initialPrice = await getTokenPriceFromDexScreener(poolId);

      console.log({ initialPrice });
      if (!initialPrice) {
        console.log("Price unknown, will exit process");
        return false;
      }
      if (SWAP_ROUTING) {
        console.log("Buy and sell with jupiter swap v6 routing");
      } else {
        poolKeys = await getPoolKeys(solConnection, baseMint);
        console.log("poolKeys", poolKeys);
        if (poolKeys == null) {
          return false;
        }
        // poolKeys = await PoolKeys.fetchPoolKeyInfo(solanaConnection, baseMint, NATIVE_MINT)
        // poolId = new PublicKey(poolKeys.id)
        quoteVault = new PublicKey(poolKeys.quoteVault);
        console.log(`Successfully fetched pool info`);
        console.log(`Pool id: ${poolId.toBase58()}`);
      }

      if (solBalance < buySolAmount + ADDITIONAL_FEE) {
        console.log("Sol balance is not enough ");
        return false;
      }

      if (solBalance < ADDITIONAL_FEE) {
        console.log("Balance is not enough: ", solBalance, "SOL");
        return false;
      }
      console.log("poolId", poolId);
      const price = await getTokenPriceFromDexScreener(poolId);
      if (!price || !initialPrice) {
        console.log("Price is not derived");
        return false;
      }
      let x = 0;

      // limit buy
      if (price < Number(triggerPrice)) {
        console.log("limit buying");
        let i = 0;
        while (true) {
          if (i > 10) {
            console.log("Error in buy transaction");
            return false;
          }

          const result = await buy(mainKp, poolId, baseMint, buySolAmount);
          if (result) {
            break;
          } else {
            i++;
            console.log("Buy failed, try again");
          }
        }
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log("err", err);
      return false;
    }
  };

  const firstRun = await executeOrder();
  if (!firstRun) return;

  const interval = setInterval(async () => {
    const shouldContinue = await executeOrder();
    if (!shouldContinue || Date.now() > expiredAt) {
      clearInterval(interval);
      console.log("Process completed or expired. Stopping now.");
    }
  }, buyInterval);
};

export const limitSellOrder = async (
  userId: string,
  secretKey: string,
  baseMint: PublicKey,
  poolId: PublicKey,
  triggerPrice: number,
  sellAmount: number,
  expiredAt: number,
  buyInterval: number
) => {
  console.log("calling limitSellOrder");
  const executeOrder = async () => {
    try {
      let poolKeys;
      let quoteVault;
      const ADDITIONAL_FEE = 0;

      const orders = await LimitOrderModel.find({
        userId: userId,
      });
      if (orders && orders.length === 0) {
        return false;
      }

      if (Date.now() > expiredAt) {
        console.log("Process completed. Stopping now.");
        return false; // Stop the process
      }
      const mainKp = Keypair.fromSecretKey(base58.decode(secretKey));

      const solBalance =
        (await solConnection.getBalance(mainKp.publicKey)) / LAMPORTS_PER_SOL;

      console.log(`Wallet address: ${mainKp.publicKey.toBase58()}`);
      console.log(`Pool token mint: ${baseMint.toBase58()}`);
      console.log(`Wallet SOL balance: ${solBalance.toFixed(3)}SOL`);
      console.log(`Interval: ${buyInterval}ms`);
      console.log(`Sell amount: ${sellAmount}`);

      console.log("poolId", poolId.toBase58());
      let initialPrice = await getTokenPriceFromDexScreener(poolId);

      console.log({ initialPrice });
      if (!initialPrice) {
        console.log("Price unknow, will exit process");
        return;
      }
      if (SWAP_ROUTING) {
        console.log("Buy and sell with jupiter swap v6 routing");
      } else {
        poolKeys = await getPoolKeys(solConnection, baseMint);
        console.log("poolKeys", poolKeys);
        if (poolKeys == null) {
          return;
        }
        // poolKeys = await PoolKeys.fetchPoolKeyInfo(solanaConnection, baseMint, NATIVE_MINT)
        // poolId = new PublicKey(poolKeys.id)
        quoteVault = new PublicKey(poolKeys.quoteVault);
        console.log(`Successfully fetched pool info`);
        console.log(`Pool id: ${poolId.toBase58()}`);
      }

      if (solBalance < ADDITIONAL_FEE) {
        console.log("Sol balance is not enough ");
        return false;
      }

      if (solBalance < ADDITIONAL_FEE) {
        console.log("Balance is not enough: ", solBalance, "SOL");
        return false;
      }
      const price = await getTokenPriceFromDexScreener(poolId);
      if (!price || !initialPrice) {
        console.log("Price is not derived");
        return false;
      }
      let x = 0;

      // limit sell
      if (price > Number(triggerPrice)) {
        console.log("limit selling");
        let i = 0;
        while (true) {
          if (i > 10) {
            console.log("Error in limit sell transaction");
            return;
          }

          // const result = await sell(mainKp, poolId, baseMint, sellAmount)
          const result = await sellWithJupiter(mainKp, baseMint, sellAmount);
          if (result) {
            break;
          } else {
            i++;
            console.log("Sell failed, try again");
          }
        }
      }
      return true;
    } catch (err) {
      console.log("err", err);
      return false;
    }
  };
  const firstRun = await executeOrder();
  if (!firstRun) return;

  const interval = setInterval(async () => {
    const shouldContinue = await executeOrder();
    if (!shouldContinue || Date.now() > expiredAt) {
      clearInterval(interval);
      console.log("Process completed or expired. Stopping now.");
    }
  }, buyInterval);
};

export const dcaOrder = async (
  secretKey: string,
  baseMint: PublicKey,
  // poolId: PublicKey,
  buySolAmount: number,
  expiredAt: number,
  buyInterval: number
) => {
  console.log("calling dcaOrder....");
  const executeOrder = async () => {
    try {
      console.log("current time", Date.now());
      console.log("expired at: ", expiredAt);
      if (Date.now() > expiredAt) {
        console.log("Process completed. Stopping now.");
        return false; // Stop the process
      }

      console.log("calling dcaOrder");
      console.log("buyInterval==>", buyInterval);
      console.log("buySolAmount", buySolAmount);

      const ADDITIONAL_FEE = 0;

      const mainKp = Keypair.fromSecretKey(base58.decode(secretKey));

      const solBalance =
        (await solConnection.getBalance(mainKp.publicKey)) / LAMPORTS_PER_SOL;

      console.log(`Wallet address: ${mainKp.publicKey.toBase58()}`);
      console.log(`Pool token mint: ${baseMint.toBase58()}`);
      console.log(`Wallet SOL balance: ${solBalance.toFixed(3)}SOL`);
      console.log(`Interval: ${buyInterval}ms`);
      console.log(`Buy amount: ${buySolAmount}ms`);

      if (SWAP_ROUTING) {
        console.log("Buy and sell with jupiter swap v6 routing");
      } else {
        console.log(`Successfully fetched pool info`);
      }

      if (solBalance < buySolAmount + ADDITIONAL_FEE) {
        console.log("Sol balance is not enough");
        return true; // Continue the process but skip execution
      }

      if (solBalance < ADDITIONAL_FEE) {
        console.log("Balance is not enough: ", solBalance, "SOL");
        return false; // Stop the process
      }

      console.log("dca buying");
      let i = 0;
      while (true) {
        if (i > 10) {
          console.log("Error in buy transaction");
          return false; // Stop the process after multiple failed attempts
        }

        const result = await buyWithJupiter(mainKp, baseMint, buySolAmount);

        if (result) {
          break;
        } else {
          i++;
          console.log("Buy failed, try again");
        }
      }

      return true; // Continue the process
    } catch (err) {
      console.log("err", err);
      return false; // Stop the process in case of an error
    }
  };

  // Run once before setting the interval
  const firstRun = await executeOrder();
  if (!firstRun) return;

  // Set the interval to run repeatedly
  const interval = setInterval(async () => {
    const shouldContinue = await executeOrder();
    if (!shouldContinue || Date.now() > expiredAt) {
      clearInterval(interval);
      console.log("Process completed or expired. Stopping now.");
    }
  }, buyInterval);
};

export const dcaSellOrder = async (
  secretKey: string,
  baseMint: PublicKey,
  // poolId: PublicKey,
  sellAmount: number,
  expiredAt: number,
  sellInterval: number
) => {
  console.log("calling dcaOrder....");
  const executeOrder = async () => {
    try {
      console.log("current time", Date.now());
      console.log("expired at: ", expiredAt);
      if (Date.now() > expiredAt) {
        console.log("Process completed. Stopping now.");
        return false; // Stop the process
      }

      console.log("calling dcaOrder");
      console.log("sellInterval==>", sellInterval);
      console.log("sellAmount", sellAmount);

      const ADDITIONAL_FEE = 0;

      const mainKp = Keypair.fromSecretKey(base58.decode(secretKey));

      const solBalance =
        (await solConnection.getBalance(mainKp.publicKey)) / LAMPORTS_PER_SOL;

      console.log(`Wallet address: ${mainKp.publicKey.toBase58()}`);
      console.log(`Pool token mint: ${baseMint.toBase58()}`);
      console.log(`Wallet SOL balance: ${solBalance.toFixed(3)}SOL`);

      // console.log("poolId", poolId.toBase58());

      if (SWAP_ROUTING) {
        console.log("Buy and sell with jupiter swap v6 routing");
      } else {
        console.log(`Successfully fetched pool info`);
      }

      if (solBalance < ADDITIONAL_FEE) {
        console.log("Balance is not enough: ", solBalance, "SOL");
        return false; // Stop the process
      }
      let i = 0;
      while (true) {
        if (i > 10) {
          console.log("Error in sell transaction");
          return false; // Stop the process after multiple failed attempts
        }

        // const result = await sell(mainKp, poolId, baseMint, sellAmount);
        const result = await sellWithJupiter(mainKp, baseMint, sellAmount);
        if (result) {
          break;
        } else {
          i++;
          console.log("sell failed, try again");
        }
      }
      return true; // Continue the process
    } catch (err) {
      console.log("err", err);
      return false; // Stop the process in case of an error
    }
  };

  // Run once before setting the interval
  const firstRun = await executeOrder();
  if (!firstRun) return;

  // Set the interval to run repeatedly
  const interval = setInterval(async () => {
    const shouldContinue = await executeOrder();
    if (!shouldContinue || Date.now() > expiredAt) {
      clearInterval(interval);
      console.log("Process completed or expired. Stopping now.");
    }
  }, sellInterval);
};
