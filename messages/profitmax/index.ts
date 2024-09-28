interface ProfitType {
  address: string;
  name: string;
  symbol: string;
  price: number;
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
      title += `\n\nAddress: ${item.address}\n   Name: ${item.name}\n   Symbol: ${item.symbol}   Price: ${item.price}`;
    });
  }

  return { title, content };
};
