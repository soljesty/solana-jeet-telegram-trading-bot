
export const generateLimitOrdersCommands = () => {

  const lo_content = [
    [
      { text: 'LIMIT BUY', callback_data: 'LIMIT_BUY'  },
      { text: 'LIMIT SELL', callback_data: 'LIMIT_SELL'  },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ]
  ]

  const lo_title = `TWAP`


  return {
    lo_title, lo_content
  }
}
