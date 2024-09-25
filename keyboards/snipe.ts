export const getSnipeKeyBoard = async (userId: string) => {

  const keyboard = [
    [
      { text: 'Add new token CA for snipe', callback_data: 'Add_Snipe_CA' },
    ],
    [
      { text: 'Cancel', callback_data: 'Cancel' },
    ]
  ]
  return keyboard;
}