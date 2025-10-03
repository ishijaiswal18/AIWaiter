
import { Box, Flex, Heading, Spacer, Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { cartCount } = useCart();

  return (
    <Flex as="header" p={4} bg="gray.100" alignItems="center">
      <Box>
        <Heading size="md">Dine-In Petpuja</Heading>
      </Box>
      <Spacer />
      <Box>
        <Button as={Link} to="/" mr={2}>Home</Button>
        <Button as={Link} to="/menu" mr={2}>Menu</Button>
        <Button as={Link} to="/cart" mr={2}>
          Cart ({cartCount})
        </Button>
        <Button as={Link} to="/dashboard">Dashboard</Button>
      </Box>
    </Flex>
  );
};

export default Header;
