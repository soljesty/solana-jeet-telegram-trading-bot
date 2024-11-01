import mongoose from 'mongoose';
import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
import dataJson from '../data.json';
dotenv.config()

export const TELEGRAM_ACCESS_TOKEN: string = process.env.TELEGRAM_ACCESS_TOKEN ? process.env.TELEGRAM_ACCESS_TOKEN: "";

export const CLUSTER: string = 'mainnet';

export const RPC_MAINNET_URL = "https://mainnet.helius-rpc.com?api-key=b84670b2-0b9f-4259-9bb5-bb1aded817df";
export const RPC_DEVNET_URL = 'https://api.devnet.solana.com';

export const RPC_WEBSOCKET_URL = "wss://mainnet.helius-rpc.com?api-key=b84670b2-0b9f-4259-9bb5-bb1aded817df";

// Solana connection without the 'wss' option
export const solConnection = new Connection(RPC_MAINNET_URL); // Remove 'wss'

// BOT_NAME
export const BOT_NAME = "JeetBot"; // Hardcoded BOT_NAME

// Other constants
export const UserCache = dataJson;
export const IS_FEE_SET = process.env.IS_FEE_SET ? process.env.IS_FEE_SET : false;
export const FEE_AMOUNT = 0.75; // percent

// Secret key (if needed)
export const SECRET_KEY = process.env.SECRET_KEY ? process.env.SECRET_KEY: "";