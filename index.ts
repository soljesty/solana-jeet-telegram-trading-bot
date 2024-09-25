import TelegramBot, { Message } from 'node-telegram-bot-api';
import { Request, Response } from 'express';
import fs from 'fs'
import { welcome } from './commands/welcome';
import { generatePuzzle } from './commands/puzzle';
import { connectDb, solConnection, TELEGRAM_ACCESS_TOKEN } from './config';
import { addNewWallet, buyAmount, getUser, getUserCacheById, getUserPubKey, getUserSecretKey, sellAmount, updateUser, verify, verifyUser } from './controllers/user';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import base58 from 'bs58'
import { convertToMilliseconds, getTokenAccountBalance, updateData, verifyDurationString } from './utils';
import { generatePriKeyConfirmCommands, generateResetConfirmCommands, generateWalletCommands } from './commands/wallet';
import { generateTwapCommands } from './commands/twap';

import { buyClick } from './messages/buy';
import { sellClick } from './messages/sell';
import { getSwapBuyKeyBoard } from './keyboards/buy';

import { getMyTokens } from './utils/token';
import { BUY_SUCCESS_MSG, ORDER_SUCCESS_MSG, SELL_SUCCESS_MSG } from './constants/msg.constants';
import { walletClick } from './messages/wallet';
import { getSwapSellKeyBoard } from './keyboards/sell';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { generateSettingCommands } from './commands/setting';
import { getSettingKeyboard } from './keyboards/setting';

const token: string = TELEGRAM_ACCESS_TOKEN
const path = './user.json';
connectDb()
export const bot = new TelegramBot(token, { polling: true });

if (bot) {
  console.log("Telegram bot is running")
}


bot.on('message', async (msg: Message) => {
  const chatId = msg.chat.id;
  const name = msg.chat.first_name;
  const username = msg.chat.username;
  const userId = msg.from?.id;

  if (!userId) return;
  const isVerified: boolean = await verifyUser(userId.toString(), {
    name: name,
    username: username
  })

  if (!isVerified) {
    if (msg.text === '/verify') return;
    bot.sendMessage(chatId, "⛔ You are not authorized. You must verify by using /verify command");
    return;
  }
});

// home commands
bot.onText(/\/home/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id
    const pubKey: any = await getUserPubKey(chatId.toString())
    const { title, content } = await welcome(pubKey)
    if (!await verify(msg)) {
      return;
    } else {
      // console.log(msg);
      bot.sendMessage(msg.chat.id, title, {
        "reply_markup": {
          "inline_keyboard": content
        }, parse_mode: 'HTML'
      });
    }
  } catch (err) {

  }
});

// start commands
bot.onText(/\/start/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id
    const pubKey: any = await getUserPubKey(chatId.toString())
    const { title, content } = await welcome(pubKey)
    if (!await verify(msg)) {
      return;
    } else {
      // console.log(msg);
      bot.sendMessage(msg.chat.id, title, {
        "reply_markup": {
          "inline_keyboard": content
        }, parse_mode: 'HTML'
      });
    }
  } catch (err) {

  }
});

// go to buy commands
bot.onText(/\/buy/, async (msg: Message) => {
  const chatId = msg.chat.id
  if (!await verify(msg)) {
    return;
  } else {
    await buyClick(bot, chatId)
  }
});

bot.onText(/\/snipe/, async (msg: Message) => {
  const chatId = msg.chat.id
  if (!await verify(msg)) {
    return;
  } else {
    await snipeClick(bot, chatId)
  }
});

// go to sell commands
bot.onText(/\/sell/, async (msg: Message) => {
  const chatId = msg.chat.id
  if (!await verify(msg)) {
    return;
  } else {
    await sellClick(bot, chatId)
  }
});

// go to wallet commands
bot.onText(/\/wallet/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id
    if (!await verify(msg)) {
      return;
    } else {
      const pubKey = await getUserPubKey(chatId.toString())
      if (pubKey) {
        await walletClick(bot, pubKey, chatId) //
      }
    }
   
  } catch (err) {

  }
});

// go to setting commands
bot.onText(/\/settings/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id
    if (!await verify(msg)) {
      return;
    } else {
      const { setting_title, setting_content } = await generateSettingCommands(chatId.toString())
      bot.sendMessage(chatId, setting_title, {
        "reply_markup": {
          "inline_keyboard": setting_content
        }, parse_mode: 'HTML'
      });
    }
  } catch (err) {

  }
});

// go to auto buy commands
bot.onText(/\/autobuy/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id
    if (!await verify(msg)) {
      return;
    } else {
      await buyClick(bot, chatId)
    }
  } catch (err) {

  }
});

bot.onText(/\/verify/, async (msg: Message) => {
  const { title, content } = await generatePuzzle() //

  console.log(msg);
  bot.sendMessage(msg.chat.id, title, {
    "reply_markup": {
      "inline_keyboard": content
    }, parse_mode: 'HTML'
  });
});


// Listen for callback queries
bot.on('callback_query', async (callbackQuery) => {
  try {
    const message = callbackQuery.message;

    if (!message) return;
    const data = callbackQuery.data;

    // Log the clicked button data
    console.log('Button clicked:', data);
    const userId: number | undefined = message.from?.id
    const chatId: number | undefined = message.chat?.id
    const messageId = message.message_id;
    const name = message.chat.first_name;
    const username = message.chat.username;
    if (!userId) return;

    let responseText = '';
    const pubKey = await getUserPubKey(chatId.toString())
    console.log("pubKey", pubKey)
    const secretKey: any = await getUserSecretKey(chatId.toString())
    const kp: any = Keypair.fromSecretKey(base58.decode(secretKey))
    if (data === 'Pear') {
      responseText = '✅ You are verified';
      const keypair = Keypair.generate()
      updateUser(chatId.toString(), {
        isVerified: true,
        name: name,
        username: username,
        walletAddress: base58.encode(keypair.secretKey)
      })

      bot.sendMessage(chatId, responseText, { parse_mode: 'HTML' });
    }
    /******************************************************************/
    /*************************** Wallet Management ********************/
    /******************************************************************/
    // go wallet
    if (data === 'Wallet') {
      if (pubKey) {
        await walletClick(bot, pubKey, chatId)
      }
    }

    // deposit sol
    if (data === 'Deposit_SOL') {
      responseText = `To deposit send SOL to below address: 
    <code>${pubKey}</code>
    `
      bot.sendMessage(chatId, responseText, { parse_mode: 'HTML' });
    }

    // export privatekey
    if (data === 'Export_PrivateKey') {
      const { export_pri_title, export_pri_content } = await generatePriKeyConfirmCommands()
      bot.sendMessage(chatId, export_pri_title, {
        "reply_markup": {
          "inline_keyboard": export_pri_content
        }, parse_mode: 'HTML'
      });
    }
    if (data === 'Cancel') {
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
    }

    // confirm showing privatekey
    if (data === 'PrivateKey_Show_Confirm') {
      responseText = `Your <b>Private Key</b> is:
<code>${secretKey}</code>
You can now e.g. import the key into a wallet like Solflare (tap to copy)
This message should auto-delete in 1 minute. If not, delete this message once you are done.`
      bot.sendMessage(chatId, responseText, { parse_mode: 'HTML' });
    }

    // withdraw sol
    if (data === 'Withdraw_SOL') {
      responseText = `Reply with the destination address`
      bot.sendMessage(chatId, responseText, { parse_mode: 'HTML' });
    }

    // reset wallet
    if (data === 'Reset_Wallet') {
      const { reset_title, reset_content } = await generateResetConfirmCommands(pubKey)
      bot.sendMessage(chatId, reset_title, {
        "reply_markup": {
          "inline_keyboard": reset_content
        }, parse_mode: 'HTML'
      });
    }

    // reset confirm
    if (data === 'Reset_Confirm') {
      await updateUser(chatId.toString(), {
        walletAddress: base58.encode(Keypair.generate().secretKey).toString()
      })
    }

    // create new wallet
    if (data === "Create_New_Wallet") {
      const res: any = await addNewWallet(chatId.toString(), base58.encode(Keypair.generate().secretKey).toString()
      )
      if (res.success) {
        bot.sendMessage(chatId, "✅ New Wallet is added", { parse_mode: 'HTML' });
        const newCommand = await generateWalletCommands(chatId.toString())
        await bot.editMessageReplyMarkup({ inline_keyboard: newCommand.content }, { chat_id: message.chat.id, message_id: message.message_id });
      }
    }

    // get my wallet assets
    if (data === 'Wallet_Assets') {
      if (pubKey) {
        const tokens = await getMyTokens(new PublicKey(pubKey))
        let totalPrice: number = 0;
        if (tokens) {
          let txt = ``
          for (let i = 0; i < (tokens?.length > 15 ? 15 : tokens?.length); i++) {
            totalPrice += tokens[i].price * tokens[i].balance
            txt += `
          CA: <code>${tokens[i].mintAddress}</code>
          name: ${tokens[i].name}
          symbol: $${tokens[i].symbol}
          decimals: ${tokens[i].decimals}
          supply: ${tokens[i].supply}
          balance: ${tokens[i].balance}
          value: ${tokens[i].price * tokens[i].balance}
          `
          }

          console.log("txt", txt)

          bot.sendMessage(
            chatId,
            `Your Tokens:
          Total Value: ${totalPrice}
          ${txt}
          `,
            { parse_mode: 'HTML' }
          );
        }
      }
    }

    // import solana wallet
    if (data === 'Import_Solana_Wallet') {
      bot.sendMessage(chatId, "Enter private key for import", { parse_mode: 'HTML' });
      bot.once('message', async (msg: Message) => {
        try {
          const privKey = msg.text;
          if (!privKey) return;
          const pubKey = Keypair.fromSecretKey(base58.decode(privKey)).publicKey.toBase58();

          const res: any = await addNewWallet(chatId.toString(), privKey.toString())
          if (res.success) {
            bot.sendMessage(chatId, "✅ New Wallet is added", { parse_mode: 'HTML' });
          }
        } catch (err) {
          bot.sendMessage(chatId, "❌ Wrong!!!", { parse_mode: 'HTML' });
        }
      })
    }

    /******************************************************************/
    /*************************** Swap Buy *****************************/
    /******************************************************************/
    if (data === 'Buy') {
      await buyClick(bot, chatId)
    }

    if (data === 'SWAP_BUY_X') {
      bot.sendMessage(chatId, "Enter the sol amount for buy", { parse_mode: 'HTML' });
      bot.once('message', async (msg: Message) => {
        const res = await updateData(chatId.toString(), {
          activeBuySwapSolAmount: Number(msg.text)
        })
        if (res.success) {
          await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
        }
      })
    }
    if (data === 'Swap_Buy_Action') {
      const userCache = await getUserCacheById(chatId.toString())
      if (userCache.activeBuySwapSolAmount) {
        const txLink = await buyAmount(userCache.activeBuySwapSolAmount, chatId.toString(), kp)
        console.log("txLink", txLink)
        if (txLink) {
          bot.sendMessage(chatId, BUY_SUCCESS_MSG, { parse_mode: 'HTML' });
        }
      } else {
        bot.sendMessage(chatId, "Parameters are not exactly set!!!", { parse_mode: 'HTML' });
      }
    }
    if (data === 'Swap_Buy') {
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'SwapBuy_0.001') {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 0.001
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'SwapBuy_1') {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 1
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'SwapBuy_3') {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 3
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'SwapBuy_5') {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 5
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    // buy 10 sol
    if (data === 'SwapBuy_10') {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 10
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    // buy x amount
    if (data === 'BUY_X') {
      await buyAmount(0.005, chatId.toString(), kp)
    }

    /******************************************************************/
    /*************************** Swap Sell ****************************/
    /******************************************************************/
    if (data === 'Sell') {
      await sellClick(bot, chatId)
    }
    if (data === 'Swap_Sell') {
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'Swap_Sell_Action') {
      const userCache = await getUserCacheById(chatId.toString())
      if (userCache.activeSellSwapPercent) {
        const txLink = await sellAmount(userCache.activeSellSwapPercent, chatId.toString(), kp)
        console.log("txLink", txLink)
        if (txLink) {
          bot.sendMessage(chatId, SELL_SUCCESS_MSG, { parse_mode: 'HTML' });
        }
      } else {
        bot.sendMessage(chatId, "Parameters are not exactly set!!!", { parse_mode: 'HTML' });
      }
    }

    if (data === 'SwapSell_5') {
      await updateData(chatId.toString(), {
        activeSellSwapPercent: 5
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'SwapSell_10') {
      await updateData(chatId.toString(), {
        activeSellSwapPercent: 10
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'SwapSell_20') {
      const res = await updateData(chatId.toString(), {
        activeSellSwapPercent: 20
      })
      if (res.success) {
        const keyboard = await getSwapSellKeyBoard(chatId.toString());
        console.log("keyboard, keyboard", keyboard)
        await bot.editMessageReplyMarkup({ inline_keyboard: keyboard }, { chat_id: message.chat.id, message_id: message.message_id });
      }
    }

    if (data === 'SwapSell_50') {
      const res = await updateData(chatId.toString(), {
        activeSellSwapPercent: 50
      })
      if (res.success) {
        const keyboard = await getSwapSellKeyBoard(chatId.toString());
        console.log("keyboard, keyboard", keyboard)
        await bot.editMessageReplyMarkup({ inline_keyboard: keyboard }, { chat_id: message.chat.id, message_id: message.message_id });
      }
    }

    if (data === 'SwapSell_100') {
      const res = await updateData(chatId.toString(), {
        activeSellSwapPercent: 100
      })
      if (res.success) {
        const keyboard = await getSwapSellKeyBoard(chatId.toString());
        console.log("keyboard, keyboard", keyboard)
        await bot.editMessageReplyMarkup({ inline_keyboard: keyboard }, { chat_id: message.chat.id, message_id: message.message_id });
      }
    }
    if (data === 'SwapSell_X') {
      bot.sendMessage(chatId, "Enter the sol amount for sell", { parse_mode: 'HTML' });
      bot.once('message', async (msg: Message) => {
        const res = await updateData(chatId.toString(), {
          activeSellSwapPercent: Number(msg.text)
        })
        if (res.success) {
          await bot.editMessageReplyMarkup({ inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
        }
      })
    }

    if (data === 'SELL_5') {
      await sellAmount(5, chatId.toString(), kp)
    }
    if (data === 'SELL_10') {
      await sellAmount(10, chatId.toString(), kp)
    }
    if (data === 'SELL_30') {
      await sellAmount(30, chatId.toString(), kp)
    }
    if (data === 'SELL_50') {
      await sellAmount(50, chatId.toString(), kp)
    }

    if (data === 'SELL_100') {
      await sellAmount(100, chatId.toString(), kp)
    }

    if (data === 'SELL_X') {
      await sellAmount(0.005, chatId.toString(), kp)
    }

    /******************************************************************/
    /*************************** Setting Dashboard ****************************/
    /******************************************************************/
    if (data === 'Setting_Dashboard') {
      const { setting_title, setting_content } = await generateSettingCommands(chatId.toString())

      bot.sendMessage(chatId, setting_title, {
        "reply_markup": {
          "inline_keyboard": setting_content
        }, parse_mode: 'HTML'
      });
    }
    if (data === 'Auto_Buy_Enable') {
      await updateData(chatId.toString(), {
        isAutoBuyEnabled: false
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSettingKeyboard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }
    if (data === 'Auto_Buy_Unable') {
      await updateData(chatId.toString(), {
        isAutoBuyEnabled: true
      })
      await bot.editMessageReplyMarkup({ inline_keyboard: await getSettingKeyboard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
    }

    if (data === 'AutoBuy_Amount') {
      bot.sendMessage(chatId, "Enter the sol amount for auto buy", { parse_mode: 'HTML' });
      bot.once('message', async (msg: Message) => {
        const res = await updateData(chatId.toString(), {
          autoBuyAmount: Number(msg.text)
        })
        if (res.success) {
          await bot.editMessageReplyMarkup({ inline_keyboard: await getSettingKeyboard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
        }
      })
    }
    if (data === 'Buy_Slippage') {
      console.log("calling Buy_Slippage...")
      bot.sendMessage(chatId, "Enter the slippage amount for buy", { parse_mode: 'HTML' });
      bot.once('message', async (msg: Message) => {
        const res = await updateData(chatId.toString(), {
          buySlippage: Number(msg.text)
        })
        if (res.success) {
          await bot.editMessageReplyMarkup({ inline_keyboard: await getSettingKeyboard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
        }
      })
    }
    if (data === 'Sell_Slippage') {
      bot.sendMessage(chatId, "Enter the slippage amount for buy", { parse_mode: 'HTML' });
      bot.once('message', async (msg: Message) => {
        const res = await updateData(chatId.toString(), {
          sellSlippage: Number(msg.text)
        })
        if (res.success) {
          await bot.editMessageReplyMarkup({ inline_keyboard: await getSettingKeyboard(chatId.toString()) }, { chat_id: message.chat.id, message_id: message.message_id });
        }
      })
    }
    
    if (data?.includes("TgWallet_")) {
      const str_arr = data.split("_")
      const newActiveId = Number(str_arr[1])
      await updateData(chatId.toString(), {
        activeWallet: newActiveId
      })
      const newCommand = await generateWalletCommands(chatId.toString())
      await bot.editMessageReplyMarkup({ inline_keyboard: newCommand.content }, { chat_id: message.chat.id, message_id: message.message_id });
    }

    else responseText = '❌ Wrong!!!';

    bot.answerCallbackQuery(callbackQuery.id);
  } catch (err) {
    console.log("err", err)
  }
});


export async function readJson(filename: string = "user.json") {
  if (!fs.existsSync(filename)) {
    // If the file does not exist, create an empty array
    fs.writeFileSync(filename, '[]', 'utf-8');
  }
  const data = fs.readFileSync(filename, 'utf-8');
  return JSON.parse(data);
}

export function writeJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}