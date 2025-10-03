
import { Box, Heading, Text, Button, VStack, HStack, Image, Input, Divider } from '@chakra-ui/react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orders';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, total } = useCart();

  const handleCheckout = async () => {
    try {
      // Using a hardcoded user ID for now
      await createOrder({ userId: 'user123', items: cartItems });
      alert('Order placed successfully!');
      // Here you would typically clear the cart and redirect the user
    } catch (error) {
      alert('Failed to place order.');
    }
  };

  return (
    <Box>
      <Heading mb={4}>Your Cart</Heading>
      {cartItems.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {cartItems.map(item => (
            <HStack key={item.id} justify="space-between">
              <HStack>
                <Image src={item.image} alt={item.name} boxSize="50px" />
                <Box>
                  <Text fontWeight="bold">{item.name}</Text>
                  <Text>₹{item.price}</Text>
                </Box>
              </HStack>
              <HStack>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  width="60px"
                />
                <Button colorScheme="red" onClick={() => removeFromCart(item.id)}>
                  Remove
                </Button>
              </HStack>
            </HStack>
          ))}
          <Divider />
          <HStack justify="space-between">
            <Text fontWeight="bold">Total:</Text>
            <Text fontWeight="bold">₹{total}</Text>
          </HStack>
          <Button colorScheme="green" size="lg" width="full" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default CartPage;
