export const generatePuzzle = async () => {
  const title = `
    Click <code>Pear</code>
  `

  const content = randomizeContentWithPear(fruits, 3, 2); 


  return {
    title, content
  }
}

interface Fruit {
  text: any;
  callback_data: string;
}

const fruits: Fruit[] = [
  { text: '🍎', callback_data: 'Apple' },
  { text: '🍐', callback_data: 'Pear' },
  { text: '🍊', callback_data: 'Tangerine' },
  { text: '🍋', callback_data: 'Lemon' },
  { text: '🍌', callback_data: 'Banana' },
  { text: '🍉', callback_data: 'Watermelon' },
  { text: '🍇', callback_data: 'Grapes' },
  { text: '🍓', callback_data: 'Strawberry' },
  { text: '🍒', callback_data: 'Cherries' },
  { text: '🍍', callback_data: 'Pineapple' },
  { text: '🥭', callback_data: 'Mango' },
  { text: '🥝', callback_data: 'Kiwi Fruit' },
  { text: '🍈', callback_data: 'Melon' },
  { text: '🍑', callback_data: 'Peach' },
  { text: '🥥', callback_data: 'Coconut' },
  { text: '🍆', callback_data: 'Eggplant' },
  { text: '🍅', callback_data: 'Tomato' },
  { text: '🥑', callback_data: 'Avocado' },
  { text: '🥦', callback_data: 'Broccoli' },
  { text: '🥒', callback_data: 'Cucumber' },
  { text: '🌽', callback_data: 'Corn' },
  { text: '🥕', callback_data: 'Carrot' },
  { text: '🍠', callback_data: 'Sweet Potato' },
  { text: '🥔', callback_data: 'Potato' },
  { text: '🥬', callback_data: 'Leafy Green' },
  { text: '🍄', callback_data: 'Mushroom' },
  { text: '🥜', callback_data: 'Peanuts' },
  { text: '🌰', callback_data: 'Chestnut' },
  { text: '🍞', callback_data: 'Bread' },
  { text: '🥐', callback_data: 'Croissant' }
];


function randomizeContentWithPear(fruits: Fruit[], numRows: number, numCols: number): Fruit[][] {
  const shuffledFruits = [...fruits].sort(() => Math.random() - 0.5); // Shuffle the fruits array
  const pearIndex = shuffledFruits.findIndex(fruit => fruit.callback_data === 'Pear');
  
  // Ensure Pear is included and remove it from shuffled list
  const pear = shuffledFruits.splice(pearIndex, 1)[0];
  
  // Randomly select other fruits to fill the grid
  const remainingFruits = shuffledFruits.slice(0, numRows * numCols - 1); // -1 for Pear
  
  // Form the content array with only one Pear
  const content: Fruit[][] = [];
  
  // Determine a random position for Pear
  const pearPosition = Math.floor(Math.random() * (numRows * numCols));
  
  for (let i = 0; i < numRows; i++) {
    const row: Fruit[] = [];
    for (let j = 0; j < numCols; j++) {
      const index = i * numCols + j;
      if (index === pearPosition) {
        row.push({ ...pear });
      } else {
        row.push(remainingFruits.pop()!);
      }
    }
    content.push(row);
  }

  return content;
}