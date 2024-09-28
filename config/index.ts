import mongoose from 'mongoose';
import { Connection } from '@solana/web3.js';

import dataJson from '../data.json';

// Hardcoded Telegram token
export const TELEGRAM_ACCESS_TOKEN: string = "7001243205:AAEBUpqHXDnQ0PirKUN4_J7tSXsC6KQK4bs";

export const MONGO_URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

export const CLUSTER: string = 'mainnet';

export const RPC_MAINNET_URL = 'https://powerful-orbital-aura.solana-mainnet.quiknode.pro/8f6897f97a5babf372da3f3c4f9170cfccdc1fb2';
export const RPC_DEVNET_URL = 'https://api.devnet.solana.com';

export const RPC_WEBSOCKET_URL = 'wss://powerful-orbital-aura.solana-mainnet.quiknode.pro/8f6897f97a5babf372da3f3c4f9170cfccdc1fb2';

// Solana connection without the 'wss' option
export const solConnection = new Connection(RPC_MAINNET_URL); // Remove 'wss'

// BOT_NAME
export const BOT_NAME = "JeetBot"; // Hardcoded BOT_NAME

// Database connection logic
export const connectDb = async () => {
  let isConnected = false;

  const connect = async () => {
    try {
      if (MONGO_URL) {
        // Connect to MongoDB
        mongoose.connect(MONGO_URL)
          .then((connection) => console.log(`MONGODB CONNECTED: ${MONGO_URL}  ${connection.connection.host}`))
          .catch(err => console.error('MongoDB connection error:', err));

        isConnected = true;
      } else {
        console.log('No Mongo URL');
      }
    } catch (error) {
      console.log(`Error: ${(error as Error).message}`);
      isConnected = false;
      // Attempt to reconnect
      setTimeout(connect, 1000); // Retry connection after 1 second
    }
  };

  connect();

  mongoose.connection.on('disconnected', () => {
    console.log('MONGODB DISCONNECTED');
    isConnected = false;
    // Attempt to reconnect
    setTimeout(connect, 1000); // Retry connection after 5 seconds
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MONGODB RECONNECTED');
    isConnected = true;
  });
};

// Other constants
export const UserCache = dataJson;
export const IS_FEE_SET = process.env.IS_FEE_SET ? process.env.IS_FEE_SET : false;
export const FEE_AMOUNT = 0.75; // percent

// Secret key (if needed)
export const SECRET_KEY = '2PStaQbV6Ly5ehGvW1JrN7hPYygFD4nT9LhK4dpM8Utfkvip5SbigLyN8UFCGes9JDyJ2CbvsxqEdJ9gThMGPPbH';
