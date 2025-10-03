
import { IconButton, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, VStack, Button, useToast } from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useLiveKit } from '../hooks/useLiveKit';
import ChatBubble from './ChatBubble';
import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

const VoiceAssistant = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cart = useCart();
  const toast = useToast();
  const { connectToRoom, startRecording, stopRecording, sendMessage, messages, isConnecting, isRecording, room, remoteTrack } = useLiveKit(cart, toast);

// ...

          <ModalFooter>
            <Button
              onClick={toggleRecording}
              leftIcon={isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
              colorScheme={isRecording ? 'red' : 'green'}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default VoiceAssistant;