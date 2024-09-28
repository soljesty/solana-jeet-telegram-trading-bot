import { getSettingKeyboard } from "../keyboards/setting"
import TelegramBot from "node-telegram-bot-api";

export const generateSettingCommands = async (userId: string) => {
  const setting_title = `
<b>Settings:</b>

<b>GENERAL SETTINGS</b>
Language: Shows the current language. Tap to switch between available languages.
Minimum Position Value: Minimum position value to show in portfolio. Will hide tokens below this threshhold. Tap to edit.

<b>AUTO BUY</b>
Immediately buy when pasting token address. Tap to toggle.

<b>BUTTONS CONFIG</b>
Customize your buy and sell buttons for buy token and manage position. Tap to edit.

<b>SLIPPAGE CONFIG</b>
Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.

<b>MEV PROTECT</b>
MEV Protect accelerates your transactions and protect against frontruns to make sure you get the best price possible.
Turbo: BONKbot will use MEV Protect, but if unprotected sending is faster it will use that instead.
Secure: Transactions are guaranteed to be protected. This is the ultra secure option, but may be slower.

<b>TRANSACTION PRIORITY</b>
Increase your Transaction Priority to improve transaction speed. Select preset or tap to edit.

<b>SELL PROTECTION</b>
100% sell commands require an additional confirmation step. Tap to toggle.

<b>CHART PREVIEW</b>
Show the Dexscreener chart preview of a selected token. Tap to toggle.  
  `

  const setting_content = await getSettingKeyboard(userId)
  return {
    setting_title, setting_content
  }
}

export const settingsClick = async (bot: TelegramBot, chatId: number) => {
  const title = "Settings Menu";
  const content = [
    [
      { text: "Enable Auto Buy", callback_data: "Enable_Auto_Buy" },
      { text: "Disable Auto Buy", callback_data: "Disable_Auto_Buy" },
    ],
    [
      { text: "Back to Menu", callback_data: "Back_To_Menu" },
    ],
  ];

  bot.sendMessage(chatId, title, {
    reply_markup: {
      inline_keyboard: content,
    },
    parse_mode: "HTML",
  });
};

export const pinClick = async (bot: TelegramBot, chatId: number) => {
  const title = "Pin Menu";
  const content = [
    [
      { text: "Pin Current Message", callback_data: "Pin_Current_Message" },
      { text: "Unpin Current Message", callback_data: "Unpin_Current_Message" },
    ],
    [
      { text: "Back to Menu", callback_data: "Back_To_Menu" },
    ],
  ];

  bot.sendMessage(chatId, title, {
    reply_markup: {
      inline_keyboard: content,
    },
    parse_mode: "HTML",
  });
};

export const refreshClick = async (bot: TelegramBot, chatId: number) => {
  const title = "Refreshing your data...";
  bot.sendMessage(chatId, title, { parse_mode: "HTML" });
  // Logic to refresh user data can be added here
};