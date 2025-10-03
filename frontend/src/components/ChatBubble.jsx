
import { Box, Text } from '@chakra-ui/react';

const ChatBubble = ({ message, isUser }) => {
  return (
    <Box
      bg={isUser ? 'blue.500' : 'gray.200'}
      color={isUser ? 'white' : 'black'}
      p={3}
      borderRadius="lg"
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      maxW="80%"
    >
      <Text>{message.text}</Text>
    </Box>
  );
};

export default ChatBubble;
