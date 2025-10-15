
import { IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, VStack, Text, HStack, useToast, Box, Flex } from '@chakra-ui/react';
import { FaMicrophone, FaCircle } from 'react-icons/fa';
import { useLiveKit } from '../hooks/useLiveKit';
import ChatBubble from './ChatBubble';
import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

const VoiceAssistant = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cart = useCart();
  const toast = useToast();
  const { connectToRoom, startRecording, stopRecording, sendMessage, messages, isConnecting, isRecording, room, remoteTrack } = useLiveKit(cart, toast);
  const initialRef = useRef();
  const finalRef = useRef();

  useEffect(() => {
    if (isOpen && !room) {
      connectToRoom();
    }
    // If modal opened and room is connected, auto-start publishing mic so it behaves like a live call
    if (isOpen && room && !isRecording) {
      // startRecording returns a promise; fire-and-forget is fine here
      startRecording().catch((err) => {
        // display toast or ignore; startRecording already shows a toast on error
        console.warn('Auto startRecording failed', err);
      });
    }
  }, [isOpen, room, connectToRoom]);



  return (
    <>
      <IconButton
        icon={<FaMicrophone />}
        colorScheme="teal"
        aria-label="Voice Assistant"
        position="fixed"
        bottom="20px"
        right="20px"
        borderRadius="full"
        boxShadow="lg"
        onClick={onOpen}
        isLoading={isConnecting}
      />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        size="md"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Text>AI Voice Assistant</Text>
              <FaCircle 
                size="8px" 
                color={isRecording ? "#38A169" : "#E53E3E"}
                style={{ animation: isRecording ? 'pulse 2s infinite' : 'none' }}
              />
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
              {messages.map((msg, idx) => (
                <ChatBubble
                  key={idx}
                  message={msg.text}
                  sender={msg.sender}
                  isUser={msg.sender === 'user'}
                />
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Box 
              p={2} 
              borderRadius="md" 
              bg={isRecording ? "green.100" : "red.100"}
              color={isRecording ? "green.700" : "red.700"}
            >
              {isRecording ? "Voice chat active" : "Connecting..."}
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box
        as="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.4; }
              100% { opacity: 1; }
            }
          `
        }}
      />
    </>
  );
};

export default VoiceAssistant;