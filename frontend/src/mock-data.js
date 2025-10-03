
export const menuItems = [
  {
    id: 1,
    name: 'Paneer Butter Masala',
    description: 'A creamy and tangy curry of paneer in a tomato-based sauce.',
    price: 250,
    image: 'https://via.placeholder.com/150',
    category: 'Main Course',
    isSpecial: true,
  },
  {
    id: 2,
    name: 'Dal Makhani',
    description: 'A classic Punjabi dish made with black lentils, butter, and cream.',
    price: 200,
    image: 'https://via.placeholder.com/150',
    category: 'Main Course',
    isSpecial: false,
  },
  {
    id: 3,
    name: 'Garlic Naan',
    description: 'Soft Indian bread with a hint of garlic.',
    price: 50,
    image: 'https://via.placeholder.com/150',
    category: 'Breads',
    isSpecial: false,
  },
  {
    id: 4,
    name: 'Gulab Jamun',
    description: 'Sweet, deep-fried dough balls soaked in a sugary syrup.',
    price: 100,
    image: 'https://via.placeholder.com/150',
    category: 'Desserts',
    isSpecial: true,
  },
];

export const orders = [
  {
    id: 1,
    table: 5,
    items: [
      { ...menuItems[0], quantity: 2 },
      { ...menuItems[2], quantity: 4 },
    ],
    status: 'Pending',
  },
  {
    id: 2,
    table: 12,
    items: [
      { ...menuItems[1], quantity: 1 },
      { ...menuItems[3], quantity: 1 },
    ],
    status: 'In Progress',
  },
];
