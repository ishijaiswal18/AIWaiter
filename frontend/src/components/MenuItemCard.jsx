
import { Box, Image, Text, Button, VStack, Heading } from '@chakra-ui/react';
import { useCart } from '../context/CartContext';

const MenuItemCard = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
      <Image src={item.image} alt={item.name} />
      <VStack p={4} align="start">
        <Heading size="md">{item.name}</Heading>
        <Text>{item.description}</Text>
        <Text fontWeight="bold">₹{item.price}</Text>
        <Button colorScheme="blue" onClick={() => addToCart(item)}>
          Add to Cart
        </Button>
      </VStack>
    </Box>
  );
};

export default MenuItemCard;
