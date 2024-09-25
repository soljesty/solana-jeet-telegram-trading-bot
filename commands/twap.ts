
export const generateTwapCommands = () => {

  const twap_content = [
    [
      { text: 'TWAP BUY', callback_data: 'TWAP_BUY'  },
      { text: 'TWAP SELL', callback_data: 'TWAP_SELL'  },
    ],
    [
      { text: 'TWAP Token', callback_data: 'TWAP_Token'  },
    ],
    [
      { text: 'Generate Mini-Wallets', callback_data: 'Gen_TWAP_Wallets'  },
      { text: 'Reset Wallet', callback_data: 'Reset_TWAP_Wallets'  },
      { text: 'Withdraw Wallet', callback_data: 'Withdraw_TWAP_Wallets'  },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ]
  ]

  const twap_title = `TWAP`


  return {
    twap_title, twap_content
  }
}
