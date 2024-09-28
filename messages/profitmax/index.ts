import { PublicKey } from "@solana/web3.js";
import TelegramBot from "node-telegram-bot-api";
import { getTokenData } from "../../utils/token";
import { addProfitMaxItem } from "../../utils";

interface ProfitType {
  address: string;
  name: string;
  symbol: string;
  amount?: number;
  mode?: "buy" | "sell";
}

export const showProfitMaxList = (info: ProfitType[] | undefined) => {
  let title = "Profit Maxi Mode List";
  const content = [
    [
      { text: "Add", callback_data: "Add_Profit" },
      { text: "Remove", callback_data: "Remove_Profit" },
      { text: "Cancel", callback_data: "Delete" },
    ],
  ];

  if (info) {
    info.forEach((item, idx) => {
      title += `\n\n#${idx}\nAddress: ${item.address}\nName: ${item.name}`;
    });
  }

  return { title, content };
};
