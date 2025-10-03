
import { Box, Heading, SimpleGrid, Text, Spinner } from '@chakra-ui/react';
import OrderCard from '../components/OrderCard';
import { useOrders } from '../hooks/useOrders';

const DashboardPage = () => {
  const { orders, isLoading, error } = useOrders();

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Text>Error fetching orders: {error.message}</Text>;
  }

  return (
    <Box>
      <Heading mb={4}>Incoming Orders</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default DashboardPage;
