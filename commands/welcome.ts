import { Keypair } from "@solana/web3.js";
import { BOT_NAME } from "../config";
import fs from "fs";

const dataFilePath = './data.json'; // Updated path

export const welcome = async (walletAddr: string, userId: number) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));

  // Register the user if not already registered
  if (!data[userId]) {
    data[userId] = {
      activeBuyMint: "65nTNuJGHme4PQvKQyJykKp1bJAkK4A8Q66sd2yBWugf",
      activeSellMint: "65nTNuJGHme4PQvKQyJykKp1bJAkK4A8Q66sd2yBWugf",
      buySlippage: 0,
      sellSlippage: 0,
      profitMaxList: []
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`User ${userId} registered successfully.`); // Log successful registration
  }

  const title = `
<b> Welcome to ${BOT_NAME} </b>
Solana’s fastest bot to trade any coin (SPL token), built by the ${BOT_NAME} community! 

You currently have no SOL in your wallet. To start trading, deposit SOL to your ${BOT_NAME} wallet address:

<code>${walletAddr}</code> (tap to copy)

Once done, tap refresh and your balance will appear here.

To buy a token enter a ticker, token address, or a URL from pump.fun, Birdeye, Dexscreener or Meteora.

For more info on your wallet and to retrieve your private key, tap the wallet button below. User funds are safe on ${BOT_NAME}, but if you expose your private key we can't protect you!
  `;

  const content = [
    [
      { text: 'Buy', callback_data: 'Buy' },
      { text: 'Sell', callback_data: 'Sell' },
    ],
    [
      { text: 'Wallet', callback_data: 'Wallet' },
      { text: 'Settings', callback_data: 'Setting_Dashboard' },
    ],
    [
      { text: 'Profit Max Mode Configuration', callback_data: 'Profit' },
    ],
    [
      { text: 'Pin', callback_data: 'Pin' },
      { text: 'Refresh', callback_data: 'Refresh' },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ]
  ];

  return { title, content };
};