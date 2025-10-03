
import { Box, Heading, Text, VStack, HStack, Button, Tag } from '@chakra-ui/react';

const OrderCard = ({ order }) => {
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <HStack justify="space-between">
        <Heading size="md">Table {order.table}</Heading>
        <Tag colorScheme={order.status === 'Pending' ? 'orange' : 'blue'}>
          {order.status}
        </Tag>
      </HStack>
      <VStack align="start" mt={4} spacing={1}>
        {order.items.map(item => (
          <Text key={item.id}>
            {item.quantity} x {item.name}
          </Text>
        ))}
      </VStack>
      <HStack justify="space-between" mt={4}>
        <Text>{totalItems} items</Text>
        <HStack>
          <Button colorScheme="green" size="sm">Accept</Button>
          <Button colorScheme="red" size="sm">Decline</Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export default OrderCard;
