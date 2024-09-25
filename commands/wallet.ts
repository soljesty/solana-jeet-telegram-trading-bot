import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BOT_NAME, solConnection } from "../config";
import { getUserCacheById, getWalletsByUserId } from "../controllers/user";
import { getActiveWallet } from "../utils";
import base58 from 'bs58'
// @ts-ignore
export const generateWalletCommands = async (chatId: string) => {
  let solBal: number;
  let title: string;
  const wallets = await getWalletsByUserId(chatId)
  // console.log("wallets", wallets)
  const activeWalletId = await getActiveWallet(chatId)
  console.log("activeWalletId", activeWalletId)
  const secretKey = wallets[activeWalletId]
  console.log("secretKey")
  const kp: any = Keypair.fromSecretKey(base58.decode(secretKey))
  const pub_key = kp.publicKey.toBase58()
  let walletKeyboards = [];
  for (let i = 0; i < wallets.length; i++) {
    walletKeyboards.push({
      text: activeWalletId === i ? ('✅ W' + i) : ('W' + i),
      callback_data: "TgWallet_" + i
    })
  }
  const content = [
    walletKeyboards,
    [
      { text: 'View on Solscan', url: `https://solscan.io/account/${pub_key}` },
      { text: 'Cancel', callback_data: 'Cancel' },
    ],
    [
      { text: 'Deposit SOL', callback_data: 'Deposit_SOL' },
      { text: 'Withdraw SOL', callback_data: 'Withdraw_SOL' },
    ],
    [
      { text: 'Reset Wallet', callback_data: 'Reset_Wallet' },
      { text: 'Export Private Key', callback_data: 'Export_PrivateKey' },
    ],
    [
      {
        text: 'Assets', callback_data: 'Wallet_Assets'
      }
    ],
    [
      {
        text: 'Create New Wallet', callback_data: 'Create_New_Wallet'
      },
      {
        text: 'Import Solana Wallet', callback_data: 'Import_Solana_Wallet'
      }
    ]
  ]
  if (pub_key) {
    solBal = (await solConnection.getBalance(new PublicKey(pub_key))) / LAMPORTS_PER_SOL;

    title = `
  <b>Your Wallet</b>:
  
  Address: <code>${pub_key}</code>
  Balance: ${solBal} SOL
  
  Tap to copy the address and send SOL to deposit.
          `;
  } else {
    title = "Wallet is not existing"
  }


  return {
    title, content
  }
}

export const generatePriKeyConfirmCommands = () => {

  const export_pri_content = [
    [
      { text: 'I Will Not Share My Private Key, I Confirm', callback_data: 'PrivateKey_Show_Confirm' },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ]
  ]

  const export_pri_title = `Are you sure you want to export your Private Key?

🚨 WARNING: Never share your private key! 🚨
If anyone, including  ${BOT_NAME} team or mods, is asking for your private key, IT IS A SCAM! Sending it to them will give them full control over your wallet.

${BOT_NAME} team and mods will NEVER ask for your private key.`


  return {
    export_pri_title, export_pri_content
  }
}

export const generateResetConfirmCommands = async (pubkey?: string | undefined | null) => {
  let reset_title: string;
  const reset_content = [
    [
      { text: 'Confirm', callback_data: 'Reset_Confirm' },
      { text: 'Cancel', callback_data: 'Cancel' },
    ],
  ]
  if (pubkey) {
    const solBal = (await solConnection.getBalance(new PublicKey(pubkey))) / LAMPORTS_PER_SOL;
    reset_title = `Are you sure you want to reset your ${BOT_NAME} Wallet?
  
  WARNING: This action is irreversible!
  
  ${BOT_NAME} will generate a new wallet for you and discard your old one.
  
  You have ${solBal} SOL in your wallet. If you don't withdraw or back up the private key it will get lost.`
  } else {
    reset_title = `Are you sure you want to reset your ${BOT_NAME} Wallet?
  
    WARNING: This action is irreversible!
    
    ${BOT_NAME} will generate a new wallet for you and discard your old one.`
  }


  return {
    reset_title, reset_content
  }
}
