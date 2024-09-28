import { Keypair, PublicKey } from "@solana/web3.js";
import { getVaultAddress, sleep } from ".";
import { SECRET_KEY, solConnection } from "../config";
import { getTokenPriceFromJupiterByTokenMint } from "./token";
import base58 from "bs58";
import { sellWithJupiter } from "./trade";
export const runProfitMaxiMode = async (
  tokenMintCA: string,
  expPrice: number
) => {
  try {
    console.log("RUNNING PROFIT MAXI MODE ===== CA: ", tokenMintCA);
    const secretKey: any = SECRET_KEY;
    const kp: Keypair = Keypair.fromSecretKey(base58.decode(secretKey));

    const { baseVault } = await getVaultAddress(tokenMintCA);
    solConnection.onLogs(
      baseVault,
      async ({ logs, err, signature }) => {
        if (err) {
          console.log(err);
        } else {
          await sleep(5000);
          try {
            const parsedData = await solConnection.getParsedTransaction(
              signature,
              {
                maxSupportedTransactionVersion: 0,
                commitment: "finalized",
              }
            );

            const postTokenBal = parsedData?.meta?.postTokenBalances;
            const preTokenBal = parsedData?.meta?.preTokenBalances;

            const accounts = parsedData?.transaction.message.accountKeys;
            const buyer = accounts![0].pubkey.toBase58();
            const IS_AMM = true;

            if (postTokenBal && preTokenBal) {
              let postQuoteBal: number = 0;
              let postBaseBal: number = 0;
              let preQuoteBal: number = 0;
              let preBaseBal: number = 0;

              const quoteMint: PublicKey = new PublicKey(
                "So11111111111111111111111111111111111111112"
              );
              const baseMint: PublicKey = new PublicKey(tokenMintCA);
              const poolOwnerAMM: PublicKey = new PublicKey(
                "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1"
              ); // Raydium Authority V4 AMM
              const poolOwnerCPMM: PublicKey = new PublicKey(
                "GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL"
              ); // CPMM POOL Auth

              postTokenBal.forEach((eachBal) => {
                if (
                  IS_AMM
                    ? eachBal.owner == poolOwnerAMM.toBase58()
                    : eachBal.owner == poolOwnerCPMM.toBase58() &&
                      eachBal.mint == baseMint.toBase58()
                ) {
                  postBaseBal = eachBal.uiTokenAmount.uiAmount!;
                }
                if (
                  IS_AMM
                    ? eachBal.owner == poolOwnerAMM.toBase58()
                    : eachBal.owner == poolOwnerCPMM.toBase58() &&
                      eachBal.mint == quoteMint.toBase58()
                ) {
                  postQuoteBal = eachBal.uiTokenAmount.uiAmount!;
                }
              });

              preTokenBal.forEach((eachBal) => {
                if (
                  IS_AMM
                    ? eachBal.owner == poolOwnerAMM.toBase58()
                    : eachBal.owner == poolOwnerCPMM.toBase58() &&
                      eachBal.mint == baseMint.toBase58()
                ) {
                  preBaseBal = eachBal.uiTokenAmount.uiAmount!;
                }

                if (
                  IS_AMM
                    ? eachBal.owner == poolOwnerAMM.toBase58()
                    : eachBal.owner == poolOwnerCPMM.toBase58() &&
                      eachBal.mint == quoteMint.toBase58()
                ) {
                  preQuoteBal = eachBal.uiTokenAmount.uiAmount!;
                }
              });
              const dTokenBal = postQuoteBal! - preQuoteBal!;
              const price = await getTokenPriceFromJupiterByTokenMint(
                tokenMintCA
              );
              console.log("dTokenBal", dTokenBal);
              if (dTokenBal < 0) {
                if (price > expPrice) {
                  console.log("==============================");
                  console.log("buy Amount:", dTokenBal);
                  console.log("price: ", price);

                  await sellWithJupiter(
                    kp,
                    new PublicKey(tokenMintCA),
                    Math.abs(dTokenBal)
                  );
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      },
      "confirmed"
    );
  } catch (err) {
    console.log("runProfitMaxiMode ERROR:", err);
  }
};
