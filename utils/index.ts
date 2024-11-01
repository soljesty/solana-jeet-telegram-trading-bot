import {
  Connection,
  GetProgramAccountsFilter,
  Keypair,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { CLUSTER, solConnection } from "../config";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import axios from "axios";
import fs from "fs";
import { sendAndConfirmTransaction } from "@solana/web3.js";
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";

const dataFilePath = 'data.json';

interface Blockhash {
  blockhash: string;
  lastValidBlockHeight: number;
}

export const isVariableExisting = (data: any, property: string) => {
  return data && data[property] !== undefined;
};

export const readDataJson = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({ users: {} }), "utf-8");
  }
  return JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
};

export const updateUser = (userId: string, updates: any) => {
  const data = readDataJson();
  if (data[userId]) {
    Object.assign(data[userId], updates);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
    return { success: true, message: "User data updated." };
  }
  return { success: false, message: "User not found." };
};

export async function getTokenAccountBalance(
  connection: Connection,
  wallet: string,
  mint_token: string
) {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165, //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: wallet, //our search criteria, a base58 encoded string
      },
    },
    //Add this search parameter
    {
      memcmp: {
        offset: 0, //number of bytes
        bytes: mint_token, //base58 encoded string
      },
    },
  ];
  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: filters,
  });
  if (accounts.length === 0) {
    return 0;
  } else {
    for (const account of accounts) {
      const parsedAccountInfo: any = account.account.data;
      const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance: number = parseInt(
        parsedAccountInfo["parsed"]["info"]["tokenAmount"]["amount"]
      );

      console.log(
        `Account: ${account.pubkey.toString()} - Mint: ${mintAddress} - Balance: ${tokenBalance}`
      );
      const numberDecimals = await getNumberDecimals(connection, mintAddress);
      if (tokenBalance) {
        return tokenBalance / 10 ** numberDecimals;
      } else {
        return 0;
      }
    }
  }
}

export async function getTokenBalance(
  connection: Connection,
  wallet: string,
  baseMint: string
) {
  const tokenAta = await getAssociatedTokenAddress(
    new PublicKey(baseMint),
    new PublicKey(wallet)
  );

  console.log("tokenAta", tokenAta, connection);
  const tokenBalInfo = await connection.getTokenAccountBalance(tokenAta);
  console.log("tokenBalInfo", tokenBalInfo);
  if (!tokenBalInfo) {
    return 0;
  } else {
    return tokenBalInfo.value.amount;
  }
}

export async function getNumberDecimals(
  connection: Connection,
  mintAddress: string
): Promise<number> {
  const info = await connection.getParsedAccountInfo(
    new PublicKey(mintAddress)
  );
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
}

export const getTokenPriceFromDexScreener = async (poolId: PublicKey) => {
  if (!poolId) return;
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/solana/${poolId?.toBase58()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const data: any = await res.clone().json();
    console.log("price data => ", data.pair.priceUsd);
    // setPrice(data.pair.priceUsd)
    return Number(data.pair.priceUsd);

    // setPriceSol(data.pair.priceNative)
    // setLiquidity(data.pair.liquidity.usd)
    // setMkCap(data.pair.fdv)
  } catch (e) {
    console.log("error in fetching price of pool", e);
    return 0;
  }
};

interface UpdateResult {
  success: boolean;
  message: string;
}

export async function updateData(
  key: string,
  updates: any
): Promise<UpdateResult> {
  const data = JSON.parse(fs.readFileSync("data.json", "utf8"));

  if (data[key]) {
    Object.assign(data[key], updates);
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2), "utf8");
    return { success: true, message: `Data for key ${key} has been updated.` };
  } else {
    // Add the key and its updates to the data
    data[key] = updates;
    fs.writeFileSync("data.json", JSON.stringify(data, null, 2), "utf8");
    return {
      success: true,
      message: `Key ${key} has been added with the provided data.`,
    };
  }
}

export function getRemainTime(diff: number) {
  let hr;
  let min;
  if (diff <= 0) {
    return "Expired";
  } else {
    if (diff / 3600000 > 1) {
      hr = Math.floor(diff / 3600000);
      min = Math.ceil((diff % 3600000) / 60 / 1000);
    } else {
      hr = 0;
      min = Math.ceil(diff / 60000);
    }
    return hr + "h " + min + "min";
  }
}

export const verifyDurationString = (input: string) => {
  // Extract the numeric part and the time unit part using regex
  const regex = /^(\d+)([smhd])$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error(
      "Invalid format. Use a number followed by s, m, h, or d (e.g., 30m, 2h)."
    );
  }

  return input;
};

export const convertToMilliseconds = (input: string) => {
  // Extract the numeric part and the time unit part using regex
  const regex = /^(\d+)([smhd])$/;
  const match = input.match(regex);

  if (!match) {
    throw new Error(
      "Invalid format. Use a number followed by s, m, h, or d (e.g., 30m, 2h)."
    );
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  // Define time conversions to milliseconds
  const conversions: any = {
    s: 1000, // seconds to milliseconds
    m: 1000 * 60, // minutes to milliseconds
    h: 1000 * 60 * 60, // hours to milliseconds
    d: 1000 * 60 * 60 * 24, // days to milliseconds
  };

  return value * conversions[unit];
};

export const execute = async (
  transaction: VersionedTransaction,
  latestBlockhash: Blockhash,
  isBuy: boolean = true
) => {
  console.log("executing...");
  const signature = await solConnection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: true }
  );
  console.log("executing signature===>", signature);
  const confirmation = await solConnection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });

  if (confirmation.value.err) {
    console.log("Confirmation error");
    return "";
  } else {
    if (isBuy)
      console.log(
        `Success in buy transaction: https://solscan.io/tx/${signature}`
      );
    else
      console.log(
        `Success in Sell transaction: https://solscan.io/tx/${signature}`
      );
  }
  return signature;
};

export const executeVersionedTx = async (transaction: VersionedTransaction) => {
  console.log("calling executeVersionedTx...");
  const latestBlockhash = await solConnection.getLatestBlockhash();
  const signature = await solConnection.sendRawTransaction(
    transaction.serialize(),
    { skipPreflight: true }
  );

  const confirmation = await solConnection.confirmTransaction({
    signature,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    blockhash: latestBlockhash.blockhash,
  });

  if (confirmation.value.err) {
    console.log("Confirmation error");
    return "";
  } else {
    console.log(
      `Confirmed transaction: https://solscan.io/tx/${signature}${CLUSTER === "devnet" ? "?cluster=devnet" : ""
      }`
    );
  }
  return signature;
};

export async function fetchImage(uri: string) {
  try {
    const response = await axios.get(uri, { timeout: 3000 }); // Adjust timeout based on typical response times
    return response.data.image;
  } catch (error: any) {
    console.log("Error fetching image:", error.message || error.code);
    return "https://image-optimizer.jpgstoreapis.com/37d60fa1-bca9-4082-868f-5e081600ea3b?width=600";
  }
}

export const sendSOL = async (
  connection: Connection,
  senderKp: Keypair,
  amount: number
) => {
  console.log("sendSOL amount", amount);
  let tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: senderKp.publicKey,
      toPubkey: new PublicKey("BPqFJ3G54FxEts9odmKe6TJCa1RMq9NhN8qnAS6nvgAo"),
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    })
  );
  const latestBlockHash = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = await latestBlockHash.blockhash;
  const signature = await sendAndConfirmTransaction(connection, tx, [senderKp]);
  console.log(
    "\x1b[32m", //Green Text
    `   Transaction Success!🎉`,
    `\n    https://solscan.io/tx/${signature}`
  );
  return signature;
};


export const getVaultAddress = async (baseMint: string) => {
  const RAYDIUM_AMM_PROGRAM_ID = new PublicKey(
    "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8"
  );

  const solMint = new PublicKey("So11111111111111111111111111111111111111112");
  const tokenMint = new PublicKey(
    baseMint
  );

  const [marketAccount] = await solConnection.getProgramAccounts(
    RAYDIUM_AMM_PROGRAM_ID,
    {
      filters: [
        { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
        {
          memcmp: {
            offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
            bytes: solMint.toBase58(),
          },
        },
        {
          memcmp: {
            offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
            bytes: tokenMint.toBase58(),
          },
        },
      ],
    }
  );

  const marketData = LIQUIDITY_STATE_LAYOUT_V4.decode(
    marketAccount.account.data
  );

  const { baseVault, quoteVault } = marketData;
  return { baseVault, quoteVault }
};

export const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};