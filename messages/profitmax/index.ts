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
  console.log(info);
  const content = [
    [
      { text: "Add", callback_data: "Add_Profit" },
      { text: "Remove", callback_data: "Remove_Profit" },
      { text: "Cancel", callback_data: "Delete" },
    ],
  ];

  if (info)
    info.map((item, idx) => {
      title += `

#${idx}
    Address: ${item.address}
    Name: ${item.name}`;
    });

  return { title, content };
};
