import TelegramBot, { Message } from "node-telegram-bot-api";
import fs from "fs";
import { welcome } from "./commands/welcome";
import { SECRET_KEY, TELEGRAM_ACCESS_TOKEN } from "./config";
import { buyAmount, getUserCacheById, sellAmount } from "./controllers/user";
import { Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import {
  isVariableExisting,
  updateData,
} from "./utils";
import {
  generatePriKeyConfirmCommands,
  generateResetConfirmCommands,
  generateWalletCommands,
} from "./commands/wallet";

import { buyClick } from "./messages/buy";
import { sellClick } from "./messages/sell";
import { getSwapBuyKeyBoard } from "./keyboards/buy";

import {
  getMyTokens,
  getTokenData,
} from "./utils/token";
import { BUY_SUCCESS_MSG, SELL_SUCCESS_MSG } from "./constants/msg.constants";
import { walletClick } from "./messages/wallet";
import { getSwapSellKeyBoard } from "./keyboards/sell";
import { generateSettingCommands } from "./commands/setting";
import { getSettingKeyboard } from "./keyboards/setting";
import { addProfitMaxAddress, addProfitMaxPrice, addTempToList, getProfitMaxConfig, getProfitMaxTempItem, removeProfitMaxItem } from "./commands/profitMax";
import { commandList } from "./constants";
import { runProfitMaxiMode } from "./utils/runProfitMaxiMode";

const token: string = TELEGRAM_ACCESS_TOKEN;

export const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands(commandList);

if (bot) {
  console.log("Telegram bot is running");
}


bot.on("message", async (msg: Message) => {
  const chatId = msg.chat.id;
  const name = msg.chat.first_name;
  const username = msg.chat.username;
  const userId = msg.from?.id; // userId is now a number

  if (!userId) return;
});


// home commands
bot.onText(/\/home/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id;
    const secretKey: any = SECRET_KEY;
    const kp: Keypair = Keypair.fromSecretKey(base58.decode(secretKey));
    const pubKey = kp.publicKey.toBase58();
    const userId = msg.from?.id ?? 0; // Ensure userId is a number, default to 0 if undefined
    const { title, content } = await welcome(pubKey, userId); // Pass userId
    bot.sendMessage(msg.chat.id, title, {
      reply_markup: {
        inline_keyboard: content,
      },
      parse_mode: "HTML",
    });
  } catch (err) { }
});


// test
bot.onText(/\/test/, async (msg: Message) => {
  try {
  } catch (err) { }
});


// start commands
bot.onText(/\/start/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id;
    const secretKey: any = SECRET_KEY;
    const kp: Keypair = Keypair.fromSecretKey(base58.decode(secretKey));
    const pubKey = kp.publicKey.toBase58();
    const userId = msg.from?.id ?? 0; // Ensure userId is a number, default to 0 if undefined
    const { title, content } = await welcome(pubKey, userId); // Pass userId
    bot.sendMessage(msg.chat.id, title, {
      reply_markup: {
        inline_keyboard: content,
      },
      parse_mode: "HTML",
    });
  } catch (err) {
    console.log(err)
  }
});


// go to buy commands
bot.onText(/\/buy/, async (msg: Message) => {
  const chatId = msg.chat.id;
  await buyClick(bot, chatId);
});


// go to sell commands
bot.onText(/\/sell/, async (msg: Message) => {
  const chatId = msg.chat.id;
  await sellClick(bot, chatId);
});


// go to wallet commands
bot.onText(/\/wallet/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id;
    await walletClick(bot, chatId);
  } catch (err) { }
});


// go to setting commands
bot.onText(/\/settings/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id;
    const { setting_title, setting_content } = await generateSettingCommands(
      chatId.toString()
    );
    bot.sendMessage(chatId, setting_title, {
      reply_markup: {
        inline_keyboard: setting_content,
      },
      parse_mode: "Markdown",
    });
  } catch (err) { }
});

// go to management profit maxi mode list
bot.onText(/\/profitmaxmode/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id;

    const { title, content } = await getProfitMaxConfig(chatId.toString());
    bot.sendMessage(chatId, title, {
      reply_markup: {
        inline_keyboard: content,
      },
      parse_mode: "HTML",
    });
  } catch (err) { }
});


// go to auto buy commands
bot.onText(/\/autobuy/, async (msg: Message) => {
  try {
    const chatId = msg.chat.id;
    await buyClick(bot, chatId);
  } catch (err) { }
});


// Listen for callback queries
bot.on("callback_query", async (callbackQuery) => {
  try {
    const message = callbackQuery.message;

    if (!message) return;
    const data = callbackQuery.data;

    // Log the clicked button data
    console.log("Button clicked:", data);
    const userId: number | undefined = message.from?.id; // Ensure userId is retrieved correctly
    const chatId: string | undefined = message.chat?.id.toString(); // Convert chatId to string
    const messageId = message.message_id;
    const name = message.chat.first_name;
    const username = message.chat.username;
    if (!userId) return;

    let responseText = "";
    const secretKey: any = SECRET_KEY;
    const kp: Keypair = Keypair.fromSecretKey(base58.decode(secretKey));
    const pubKey = kp.publicKey.toBase58();

    /******************************************************************/
    /*************************** Wallet Management ********************/
    /******************************************************************/
    // go wallet
    if (data === "Wallet") {
      if (pubKey) {
        await walletClick(bot, parseInt(chatId, 10));
      }
    }

    // deposit sol
    if (data === "Deposit_SOL") {
      responseText = `To deposit send SOL to below address: 
    <code>${pubKey}</code>
    `;
      bot.sendMessage(chatId, responseText, { parse_mode: "HTML" });
    }

    // export privatekey
    if (data === "Export_PrivateKey") {
      const { export_pri_title, export_pri_content } =
        await generatePriKeyConfirmCommands();
      bot.sendMessage(chatId, export_pri_title, {
        reply_markup: {
          inline_keyboard: export_pri_content,
        },
        parse_mode: "HTML",
      });
    }

    if (data === "Cancel") {
      bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        { chat_id: chatId, message_id: messageId }
      );
    }

    if (data === "Delete") {
      bot.deleteMessage(chatId, messageId);
    }

    /******************************************************************/
    /************** Profit Maxi Mode List Management ******************/
    /******************************************************************/

    // Show profit maxi mode list
    if (data === "Profit") {
      const { title, content } = await getProfitMaxConfig(chatId.toString());
      bot.sendMessage(chatId, title, {
        reply_markup: {
          inline_keyboard: content,
        },
        parse_mode: "HTML",
      });
    }

    // Remove item form profit maxi mode list
    if (data === "Remove_Profit") {
      bot.sendMessage(chatId, "Enter a token address to remove", {
        parse_mode: "HTML",
      });

      bot.once("message", async (msg: any) => {
        if (!msg.text) return;
        const address = msg.text;

        try {
          const { success, message } = await removeProfitMaxItem(
            address,
            parseInt(chatId)
          );
          bot.sendMessage(
            chatId,
            success
              ? `Successfully Removed. ${message}`
              : `Removed failed. ${message}`,
            {
              parse_mode: "HTML",
            }
          );
        } catch (err) {
          bot.sendMessage(
            chatId,
            "Token Address is not Valid... Try with another token!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "Try Again", callback_data: "Add_Profit" },
                    { text: "Cancel", callback_data: "Delete" },
                  ],
                ],
              },
              parse_mode: "HTML",
            }
          );
        }
      });
    }

    // Show msg to add item profit maxi mode temp list
    if (data === "Add_Profit") {
      const item = await getProfitMaxTempItem(chatId)
      bot.sendMessage(chatId, item.title, {
        reply_markup: {
          inline_keyboard: item.content
        },
        parse_mode: "HTML",
      });
    }

    // Input address to added to profit maxi mode temp list
    if (data == 'Add_Address') {
      bot.sendMessage(chatId, `Enter a token Address to add `, {
        parse_mode: "HTML",
      });

      bot.once("message", async (msg: any) => {
        if (!msg.text) return;
        const address = msg.text;

        try {
          const isValid: boolean = PublicKey.isOnCurve(new PublicKey(address));
          console.log("isValid", isValid);
          const { name, symbol } = await getTokenData(address);
          console.log("metadata", name, symbol);
          if (!!name && !!symbol) {
            const { success, message } = await addProfitMaxAddress(
              address,
              name,
              symbol,
              chatId
            );
            if (success == true) {
              
              const item = await getProfitMaxTempItem(chatId)
              bot.sendMessage(chatId, item.title, {
                reply_markup: {
                  inline_keyboard: item.content
                },
                parse_mode: "HTML",
              });
            }
          } else {
            bot.sendMessage(
              chatId,
              "Token Address is not Valid... Try with another token!!",
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: "Try Again", callback_data: "Add_Profit" },
                      { text: "Cancel", callback_data: "Delete" },
                    ],
                  ],
                },
                parse_mode: "HTML",
              }
            );
          }
        } catch (err) {
          bot.sendMessage(
            chatId,
            "Token Address is not Valid... Try with another token!!",
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: "Try Again", callback_data: "Add_Profit" },
                    { text: "Cancel", callback_data: "Delete" },
                  ],
                ],
              },
              parse_mode: "HTML",
            }
          );
        }
      });
    }

    // // Input price to added to profit maxi mode temp list
    // if (data == 'Add_Price') {
    //   bot.sendMessage(chatId, `Enter a token Address to add `, {
    //     parse_mode: "HTML",
    //   });

    //   bot.once("message", async (msg: any) => {
    //     if (!msg.text) return;
    //     const price = msg.text;

    //     try {
    //       const isValid: boolean = Number(price) > 0
    //       console.log("isValid", isValid);
    //       if (isValid) {
    //         const { success, message } = await addProfitMaxPrice(
    //           Number(price),
    //           chatId
    //         );
    //         if (success == true) {
    //           const item = await getProfitMaxTempItem(chatId)
    //           bot.sendMessage(chatId, item.title, {
    //             reply_markup: {
    //               inline_keyboard: item.content
    //             },
    //             parse_mode: "HTML",
    //           });
    //         }
    //       } else {
    //         bot.sendMessage(
    //           chatId,
    //           "Token Price is not Valid... Try with another number!!",
    //           {
    //             reply_markup: {
    //               inline_keyboard: [
    //                 [
    //                   { text: "Try Again", callback_data: "Add_Price" },
    //                   { text: "Cancel", callback_data: "Delete" },
    //                 ],
    //               ],
    //             },
    //             parse_mode: "HTML",
    //           }
    //         );
    //       }
    //     } catch (err) {
    //       bot.sendMessage(
    //         chatId,
    //         "Token Price is not Valid... Try with another number!!",
    //         {
    //           reply_markup: {
    //             inline_keyboard: [
    //               [
    //                 { text: "Try Again", callback_data: "Add_Price" },
    //                 { text: "Cancel", callback_data: "Delete" },
    //               ],
    //             ],
    //           },
    //           parse_mode: "HTML",
    //         }
    //       );
    //     }
    //   });
    // }

    // Insert profit maxi mode temp list to main list
    if (data == 'Temp_To_List') {
      try {
        const data = await addTempToList(chatId)
        if(data.success){
          await runProfitMaxiMode(data.address)
          bot.sendMessage(chatId, data.message, {
            reply_markup: {
              inline_keyboard: [[{ text: "Close", callback_data: "Delete" }]]
            },
            parse_mode: "HTML",
          });
        }
        
      } catch (err) {
        bot.sendMessage(
          chatId,
          "Failed... Please try again!!",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Try Again", callback_data: "Temp_To_List" },
                  { text: "Cancel", callback_data: "Delete" },
                ],
              ],
            },
            parse_mode: "HTML",
          }
        );
      }
    }


    // confirm showing privatekey
    if (data === "PrivateKey_Show_Confirm") {
      responseText = `Your <b>Private Key</b> is:
<code>${secretKey}</code>
You can now e.g. import the key into a wallet like Solflare (tap to copy)
This message should auto-delete in 1 minute. If not, delete this message once you are done.`;
      bot.sendMessage(chatId, responseText, { parse_mode: "HTML" });
    }

    // withdraw sol
    if (data === "Withdraw_SOL") {
      responseText = `Reply with the destination address`;
      bot.sendMessage(chatId, responseText, { parse_mode: "HTML" });
    }

    // reset wallet
    if (data === "Reset_Wallet") {
      const { reset_title, reset_content } = await generateResetConfirmCommands(
        pubKey
      );
      bot.sendMessage(chatId, reset_title, {
        reply_markup: {
          inline_keyboard: reset_content,
        },
        parse_mode: "HTML",
      });
    }

    /******************************************************************/
    /*************************** Swap Buy *****************************/
    /******************************************************************/
    if (data === "Buy") {
      await buyClick(bot, parseInt(chatId));
    }

    if (data === "SWAP_BUY_X") {
      bot.sendMessage(chatId, "Enter the sol amount for buy", {
        parse_mode: "HTML",
      });
      bot.once("message", async (msg: Message) => {
        const user_cache = await getUserCacheById(chatId.toString());
        if (user_cache.activeBuySwapSolAmount === Number(msg.text)) return;
        const res = await updateData(chatId.toString(), {
          activeBuySwapSolAmount: Number(msg.text),
        });
        if (res.success) {
          await bot.editMessageReplyMarkup(
            { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
            { chat_id: message.chat.id, message_id: message.message_id }
          );
        }
      });
    }
    if (data === "Swap_Buy_Action") {
      const userCache = await getUserCacheById(chatId.toString());
      if (userCache.activeBuySwapSolAmount) {
        const txLink = await buyAmount(
          userCache.activeBuySwapSolAmount,
          chatId.toString(),
          kp
        );
        console.log("txLink", txLink);
        if (txLink) {
          bot.sendMessage(chatId, BUY_SUCCESS_MSG, { parse_mode: "HTML" });
        }
      } else {
        bot.sendMessage(chatId, "Parameters are not exactly set!!!", {
          parse_mode: "HTML",
        });
      }
    }
    if (data === "Swap_Buy") {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "SwapBuy_0.001") {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 0.001,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "SwapBuy_1") {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 1,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "SwapBuy_3") {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 3,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "SwapBuy_5") {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 5,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    // buy 10 sol
    if (data === "SwapBuy_10") {
      await updateData(chatId.toString(), {
        activeBuySwapSolAmount: 10,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapBuyKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    // buy x amount
    if (data === "BUY_X") {
      await buyAmount(0.005, chatId.toString(), kp);
    }

    /******************************************************************/
    /*************************** Swap Sell ****************************/
    /******************************************************************/
    if (data === "Sell") {
      await sellClick(bot, parseInt(chatId));
    }
    if (data === "Swap_Sell") {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "Swap_Sell_Action") {
      const userCache = await getUserCacheById(chatId.toString());
      if (userCache.activeSellSwapPercent) {
        const txLink = await sellAmount(
          userCache.activeSellSwapPercent,
          chatId.toString(),
          kp
        );
        console.log("txLink", txLink);
        if (txLink) {
          bot.sendMessage(chatId, SELL_SUCCESS_MSG, { parse_mode: "HTML" });
        }
      } else {
        bot.sendMessage(chatId, "Parameters are not exactly set!!!", {
          parse_mode: "HTML",
        });
      }
    }

    if (data === "SwapSell_5") {
      await updateData(chatId.toString(), {
        activeSellSwapPercent: 5,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "SwapSell_10") {
      await updateData(chatId.toString(), {
        activeSellSwapPercent: 10,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "SwapSell_20") {
      const res = await updateData(chatId.toString(), {
        activeSellSwapPercent: 20,
      });
      if (res.success) {
        const keyboard = await getSwapSellKeyBoard(chatId.toString());
        console.log("keyboard, keyboard", keyboard);
        await bot.editMessageReplyMarkup(
          { inline_keyboard: keyboard },
          { chat_id: message.chat.id, message_id: message.message_id }
        );
      }
    }

    if (data === "SwapSell_50") {
      const res = await updateData(chatId.toString(), {
        activeSellSwapPercent: 50,
      });
      if (res.success) {
        const keyboard = await getSwapSellKeyBoard(chatId.toString());
        console.log("keyboard, keyboard", keyboard);
        await bot.editMessageReplyMarkup(
          { inline_keyboard: keyboard },
          { chat_id: message.chat.id, message_id: message.message_id }
        );
      }
    }

    if (data === "SwapSell_100") {
      const res = await updateData(chatId.toString(), {
        activeSellSwapPercent: 100,
      });
      if (res.success) {
        const keyboard = await getSwapSellKeyBoard(chatId.toString());
        console.log("keyboard, keyboard", keyboard);
        await bot.editMessageReplyMarkup(
          { inline_keyboard: keyboard },
          { chat_id: message.chat.id, message_id: message.message_id }
        );
      }
    }
    if (data === "SwapSell_X") {
      const user_cache = await getUserCacheById(chatId.toString());
      bot.sendMessage(chatId, "Enter the sol amount for sell", {
        parse_mode: "HTML",
      });
      bot.once("message", async (msg: Message) => {
        if (user_cache.activeSellSwapPercent === Number(msg.text)) return;
        const res = await updateData(chatId.toString(), {
          activeSellSwapPercent: Number(msg.text),
        });
        if (res.success) {
          await bot.editMessageReplyMarkup(
            { inline_keyboard: await getSwapSellKeyBoard(chatId.toString()) },
            { chat_id: message.chat.id, message_id: message.message_id }
          );
        }
      });
    }

    if (data === "SELL_5") {
      await sellAmount(5, chatId.toString(), kp);
    }
    if (data === "SELL_10") {
      await sellAmount(10, chatId.toString(), kp);
    }
    if (data === "SELL_30") {
      await sellAmount(30, chatId.toString(), kp);
    }
    if (data === "SELL_50") {
      await sellAmount(50, chatId.toString(), kp);
    }

    if (data === "SELL_100") {
      await sellAmount(100, chatId.toString(), kp);
    }

    if (data === "SELL_X") {
      await sellAmount(0.005, chatId.toString(), kp);
    }

    /******************************************************************/
    /*************************** Setting Dashboard ********************/
    /******************************************************************/
    if (data === "Setting_Dashboard") {
      const { setting_title, setting_content } = await generateSettingCommands(
        chatId.toString()
      );

      bot.sendMessage(chatId, setting_title, {
        reply_markup: {
          inline_keyboard: setting_content,
        },
        parse_mode: "HTML",
      });
    }
    if (data === "Auto_Buy_Enable") {
      await updateData(chatId.toString(), {
        isAutoBuyEnabled: 2,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSettingKeyboard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }
    if (data === "Auto_Buy_Unable") {
      await updateData(chatId.toString(), {
        isAutoBuyEnabled: 1,
      });
      await bot.editMessageReplyMarkup(
        { inline_keyboard: await getSettingKeyboard(chatId.toString()) },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    }

    if (data === "AutoBuy_Amount") {
      const user_cache = await getUserCacheById(chatId.toString());
      bot.sendMessage(chatId, "Enter the sol amount for auto buy", {
        parse_mode: "HTML",
      });
      bot.once("message", async (msg: Message) => {
        if (user_cache.autoBuyAmount === Number(msg.text)) return;
        const res = await updateData(chatId.toString(), {
          autoBuyAmount: Number(msg.text),
        });
        if (res.success) {
          await bot.editMessageReplyMarkup(
            { inline_keyboard: await getSettingKeyboard(chatId.toString()) },
            { chat_id: message.chat.id, message_id: message.message_id }
          );
        }
      });
    }

    if (data === "Buy_Slippage") {
      const user_cache = await getUserCacheById(chatId.toString());
      bot.sendMessage(chatId, "Enter the slippage amount for buy", {
        parse_mode: "HTML",
      });
      bot.once("message", async (msg: Message) => {
        if (
          isVariableExisting(user_cache, "buySlippage") &&
          user_cache.buySlippage === Number(msg.text)
        )
          return;
        const res = await updateData(chatId.toString(), {
          buySlippage: Number(msg.text),
        });
        if (res.success) {
          await bot.editMessageReplyMarkup(
            { inline_keyboard: await getSettingKeyboard(chatId.toString()) },
            { chat_id: message.chat.id, message_id: message.message_id }
          );
        }
      });
    }
    if (data === "Sell_Slippage") {
      const user_cache = await getUserCacheById(chatId.toString());

      bot.sendMessage(chatId, "Enter the slippage amount for buy", {
        parse_mode: "HTML",
      });
      bot.once("message", async (msg: Message) => {
        if (
          isVariableExisting(user_cache, "sellSlippage") &&
          user_cache.sellSlippage === Number(msg.text)
        )
          return;
        const res = await updateData(chatId.toString(), {
          sellSlippage: Number(msg.text),
        });
        if (res.success) {
          await bot.editMessageReplyMarkup(
            { inline_keyboard: await getSettingKeyboard(chatId.toString()) },
            { chat_id: message.chat.id, message_id: message.message_id }
          );
        }
      });
    }

    if (data === 'Wallet_Assets') {
      if (pubKey) {
        const tokens = await getMyTokens(new PublicKey(pubKey))
        let totalPrice: number = 0;
        if (tokens) {
          let txt = ``
          for (let i = 0; i < (tokens?.length > 15 ? 15 : tokens?.length); i++) {
            if (tokens[i].balance === 0) continue;
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

    if (data?.includes("TgWallet_")) {
      const str_arr = data.split("_");
      const newActiveId = Number(str_arr[1]);
      await updateData(chatId.toString(), {
        activeWallet: newActiveId,
      });
      const newCommand = await generateWalletCommands();
      await bot.editMessageReplyMarkup(
        { inline_keyboard: newCommand.content },
        { chat_id: message.chat.id, message_id: message.message_id }
      );
    } else responseText = "❌ Wrong!!!";

    bot.answerCallbackQuery(callbackQuery.id);
  } catch (err) {
    console.log("err", err);
  }
});


export async function readJson(filename: string = "user.json") {
  if (!fs.existsSync(filename)) {
    // If the file does not exist, create an empty array
    fs.writeFileSync(filename, "[]", "utf-8");
  }
  const data = fs.readFileSync(filename, "utf-8");
  return JSON.parse(data);
}

export function writeJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}