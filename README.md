<picture>
 <source media="(prefers-color-scheme: dark)" srcset="https://pbs.twimg.com/media/GXbGYHhWUAAbTeH?format=jpg&name=medium">
 <source media="(prefers-color-scheme: light)" srcset="https://pbs.twimg.com/media/GXbGYHhWUAAbTeH?format=jpg&name=medium">
 <img alt="YOUR-ALT-TEXT" src="YOUR-DEFAULT-IMAGE">
</picture>


# <p align="center"> Solving the liquidity crisis one FSH at a time </p>

[JeetBot Google Doc](https://docs.google.com/document/d/126Vz6qe1qpvXhhExuJFOIP4DaUh57tWeDTEfUH2zDag/edit)

## MVP Main Functions of JeetBot 

- [x] Codebase in TypeScript
- [x] Telegram Interface
- [ ] Menu with feature selection
- [ ] Generate & Import Wallet function
- [ ] Buy & Sell functions (1% fee on all transactions, custom order size, custom slippage)
- [ ] ProfitMaxi mode function





## Menu with feature options

![image](https://github.com/user-attachments/assets/5ad27141-2108-4afd-8fc1-3baff4fc4190)

## Wallet generation & import wallet

![image](https://github.com/user-attachments/assets/3651eed2-6966-4cb1-9aa0-7120752aa9e0)


## User input for token address & pull information from Jupiter

![image](https://github.com/user-attachments/assets/a086cace-b977-40e1-9414-4a8a7cc385fa)


## Buy feature with custom slippage & order sizing

![image](https://github.com/user-attachments/assets/abbb4781-e777-4b20-a2b1-cb76bcfd593d)

## Sell feature

![image](https://github.com/user-attachments/assets/7a32cdd9-6e36-4d6d-aa71-d8b301d2fcb5)


![image](https://github.com/user-attachments/assets/e944e9ed-3bce-4e20-84d5-c5d4877e8340)




## ProfitMaxi mode:
---
> Sell function to maximize returns to the user passively & reducing negative volatility on the chart.

- create a pending sell order (ex. 100SOL)
- monitor the LiquidityPool for incoming buy orders (minimum size of buy order setting)
- create equal sized sell orders to match the incoming buys
- subtract the order from the remaining pending sell order
- continue this process until the entire order is filled


> [!IMPORTANT]
> This is +EV for all parties involved; sellers, potential new buyers, the tokens project


Here is an example of some code i was attempting for the profitmaxi mode using typescript so you get an idea.

```typescript
// src/profitMaxi.ts

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import type { OrderParams } from '@project-serum/serum/lib/market';
import { loadMarket } from './utils';

export class ProfitMaxi {
  private connection: Connection;
  private keypair: Keypair;
  private marketAddress: PublicKey;
  private market!: Market; // Non-null assertion
  private initialSellSize: number;
  private percentage: number;

  constructor(
    connection: Connection,
    keypair: Keypair,
    marketAddress: PublicKey,
    percentage: number
  ) {
    this.connection = connection;
    this.keypair = keypair;
    this.marketAddress = marketAddress;
    this.percentage = percentage;
    this.initialSellSize = 0;
  }

  public async start() {
    // Load the market
    this.market = await loadMarket(this.connection, this.marketAddress);

    // **Place the code snippet here**
    // Log base and quote mints
    console.log(`Base Token Mint: ${this.market.baseMintAddress.toBase58()}`);
    console.log(`Quote Token Mint: ${this.market.quoteMintAddress.toBase58()}`);

    // Calculate initial sell size
    await this.calculateInitialSellSize();

    if (this.initialSellSize <= 0) {
      console.log('No available balance to sell.');
      return;
    }

    // Start monitoring and executing market sells
    await this.monitorIncomingBuyOrders();
  }

  private async calculateInitialSellSize() {
    const owner = this.keypair;
    const baseTokenAccounts = await this.market.findBaseTokenAccountsForOwner(
      this.connection,
      owner.publicKey
    );

    if (baseTokenAccounts.length === 0) {
      console.log('No base token accounts found.');
      return;
    }

    const baseTokenAccount = baseTokenAccounts[0];

    // Fetch the balance of the base token
    const tokenBalance = await this.connection.getTokenAccountBalance(
      baseTokenAccount.pubkey
    );
    const availableBalance = parseFloat(tokenBalance.value.uiAmountString || '0');

    // Calculate the amount to sell based on the percentage
    this.initialSellSize = (availableBalance * this.percentage) / 100;

    console.log(`Available Balance: ${availableBalance}`);
    console.log(`Percentage to Sell: ${this.percentage}%`);
    console.log(`Initial Sell Size: ${this.initialSellSize}`);
  }

  private async monitorIncomingBuyOrders() {
    console.log('Starting to monitor incoming buy orders...');

    // Use market's bids address
    const bidsAddress = this.market.bidsAddress;

    this.connection.onAccountChange(
      bidsAddress,
      async (accountInfo) => {
        try {
          // Load the latest bids
          const bids = await this.market.loadBids(this.connection);

          // Iterate over the top bids
          for (const [price, size] of bids.getL2(20)) {
            console.log(`Detected Incoming Buy Order - Price: ${price}, Size: ${size}`);

            if (this.initialSellSize <= 0) {
              console.log('All initial sell amount has been sold.');
              return;
            }

            // Determine the size to sell (cannot exceed the remaining initial sell size)
            const sellSize = Math.min(size, this.initialSellSize);

            // Execute market sell order
            await this.placeMarketSellOrder(sellSize);

            // Subtract the sold size from the initial sell size
            this.initialSellSize -= sellSize;

            console.log(`Remaining sell size: ${this.initialSellSize}`);

            // If all the initial sell size has been sold, exit the loop
            if (this.initialSellSize <= 0) {
              console.log('Completed selling the initial amount.');
              return;
            }
          }
        } catch (error) {
          console.error('Error in monitoring incoming buy orders:', error);
        }
      },
      'confirmed'
    );
  }

  private async placeMarketSellOrder(size: number) {
    try {
      const owner = this.keypair;
      const baseTokenAccounts = await this.market.findBaseTokenAccountsForOwner(
        this.connection,
        owner.publicKey
      );

      if (baseTokenAccounts.length === 0) {
        console.log('No base token accounts found.');
        return;
      }

      const baseTokenAccount = baseTokenAccounts[0];

      // Fetch the balance of the base token
      const tokenBalance = await this.connection.getTokenAccountBalance(
        baseTokenAccount.pubkey
      );
      const availableBalance = parseFloat(tokenBalance.value.uiAmountString || '0');

      // Determine the size to sell (cannot exceed the available balance)
      const sellSize = Math.min(size, availableBalance);

      if (sellSize <= 0) {
        console.log('No available balance to sell.');
        return;
      }

      // Create the market sell order
      const order: OrderParams<PublicKey> = {
        owner: owner.publicKey,
        payer: baseTokenAccount.pubkey,
        side: 'sell',
        price: 0, // Market order
        size: sellSize,
        orderType: 'ioc', // Changed from 'immediateOrCancel' to 'ioc'
        selfTradeBehavior: 'decrementTake',
      };

      const tx = new Transaction();
      const placeOrderInstruction = await this.market.makePlaceOrderInstruction(
        this.connection,
        order
      );

      tx.add(placeOrderInstruction);

      // Sign and send the transaction
      const signature: TransactionSignature = await this.connection.sendTransaction(
        tx,
        [owner],
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      console.log(`Market sell order executed. Size: ${sellSize}, Signature: ${signature}`);
    } catch (error) {
      console.error('Error placing market sell order:', error);
    }
  }
}
```
