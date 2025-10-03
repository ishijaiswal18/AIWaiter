
import { Box, Heading, VStack } from '@chakra-ui/react';
import VoiceAssistant from '../components/VoiceAssistant';

const HomePage = () => (
  <Box>
    <VStack spacing={8}>
      <Heading>Welcome to Dine-In Petpuja</Heading>
      <VoiceAssistant />
    </VStack>
  </Box>
);

export default HomePage;
