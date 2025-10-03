
import { Box, Heading, SimpleGrid, Text, Spinner } from '@chakra-ui/react';
import MenuItemCard from '../components/MenuItemCard';
import { useMenu } from '../hooks/useMenu';

const MenuPage = () => {
  const { menu, isLoading, error } = useMenu();

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <Text>Error fetching menu: {error.message}</Text>;
  }

  return (
    <Box>
      <Heading mb={4}>Our Menu</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
        {menu.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default MenuPage;
