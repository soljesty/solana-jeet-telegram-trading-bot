import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BOT_NAME, SECRET_KEY, solConnection } from "../config";
import base58 from 'bs58'

export const generateWalletCommands = async () => {
  let solBal: number;
  let title: string;

  const secretKey = SECRET_KEY
  console.log("secretKey")
  const kp: any = Keypair.fromSecretKey(base58.decode(secretKey))
  const pub_key = kp.publicKey.toBase58()
 
  const content = [
    [
      { text: 'View on Solscan', url: `https://solscan.io/account/${pub_key}` },
      { text: 'Cancel', callback_data: 'Cancel' },
    ],
    [
      { text: 'Deposit SOL', callback_data: 'Deposit_SOL' },
      { text: 'Withdraw SOL', callback_data: 'Withdraw_SOL' },
    ],
    [
      { text: 'Export Private Key', callback_data: 'Export_PrivateKey' },
    ],
    [
      {
        text: 'Assets', callback_data: 'Wallet_Assets'
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
