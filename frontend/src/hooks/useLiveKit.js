import { useState, useEffect, useCallback } from 'react';
import { Room, RoomEvent, RemoteAudioTrack, createLocalAudioTrack } from 'livekit-client';
import { useNavigate } from 'react-router-dom';

const LIVEKIT_URL = 'wss://ai-waiter-c5qys2gz.livekit.cloud';

export const useLiveKit = (cart, toast) => {
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTrack, setRemoteTrack] = useState(null);
  const navigate = useNavigate();
  const [newRoom] = useState(new Room());

  const getToken = useCallback(async (roomName, participantName) => {
    try {
      const response = await fetch('http://localhost:5000/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName, participantName }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      const { token } = await response.json();
      return token;
    } catch (error) {
      toast({
        title: 'Error fetching token',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [toast]);

  const handleCommand = useCallback((command) => {
    const { type, payload } = command;
    if (type === 'navigate') {
      navigate(payload);
    } else if (type === 'add_to_cart') {
      if (cart) {
        cart.addToCart(payload);
      }
    }
  }, [navigate, cart]);

  const connectToRoom = useCallback(async (roomName, participantName) => {
    setIsConnecting(true);
    try {
      const token = await getToken(roomName, participantName);
      if (!token) return;

      await newRoom.connect(LIVEKIT_URL, token);
      setRoom(newRoom);

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('[AUDIO DEBUG] track subscribed', {
          participant: participant.identity,
          trackSid: publication.trackSid,
          kind: publication.kind,
          isSubscribed: publication.isSubscribed,
        });
        if (track instanceof RemoteAudioTrack) {
          setRemoteTrack(track);
          const audioEl = document.createElement('audio');
          track.attach(audioEl);
          audioEl.oncanplay = () => console.log('[AUDIO DEBUG] audio canplay');
          audioEl.onplaying = () => console.log('[AUDIO DEBUG] audio playing');
          audioEl.onerror = (e) => console.log('[AUDIO DEBUG] audio error', e);
          audioEl.play().catch(err => {
            console.log('[AUDIO DEBUG] play() error', err);
            toast({
              title: 'Error playing audio',
              description: 'Please click anywhere on the page to enable audio playback.',
              status: 'warning',
              duration: 5000,
              isClosable: true,
            });
          });
        }
      });

      newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
        const decoder = new TextDecoder();
        const messageStr = decoder.decode(payload);
        try {
          const message = JSON.parse(messageStr);
          if (message.type === 'command') {
            handleCommand(message);
          } else {
            setMessages((prev) => [...prev, { text: message.text, sender: participant.identity }]);
          }
        } catch (error) {
            setMessages((prev) => [...prev, { text: messageStr, sender: participant.identity }]);
        }
      });

    } catch (error) {
      console.error('Failed to connect to LiveKit room', error);
      toast({
        title: 'Failed to connect to LiveKit room',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConnecting(false);
    }
  }, [getToken, handleCommand, toast, newRoom]);

  const startRecording = useCallback(async () => {
    console.log('[AUDIO DEBUG] Start clicked');
    if (room) {
      try {
        const localAudioTrack = await createLocalAudioTrack();
        if (!localAudioTrack.mediaStreamTrack) {
          throw new Error('Could not create audio track. Please grant microphone permissions.');
        }
        console.log('[AUDIO DEBUG] created audioTrack', {
          id: localAudioTrack.id,
          kind: localAudioTrack.kind,
          enabled: localAudioTrack.mediaStreamTrack.enabled,
          readyState: localAudioTrack.mediaStreamTrack.readyState,
        });
        console.log('[AUDIO DEBUG] localParticipant', room.localParticipant);
        await room.localParticipant.publishTrack(localAudioTrack);
        console.log('[AUDIO DEBUG] publish result', {
          publications: Array.from(room.localParticipant.audioTracks.values()).map((p) => ({
            id: p.trackSid || p.track?.id || p.sid,
            kind: p.track?.kind,
            muted: p.muted,
            subscribed: p.isSubscribed,
          })),
        });
        setLocalTrack(localAudioTrack);
        setIsRecording(true);
        toast({ title: 'Mic On', status: 'success', duration: 2000 });
      } catch (error) {
        console.error('[AUDIO DEBUG] Error starting recording', error);
        toast({
          title: 'Error starting recording',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  }, [room, toast]);

  const stopRecording = useCallback(async () => {
    console.log('[AUDIO DEBUG] Stop clicked');
    if (room && localTrack) {
      room.localParticipant.unpublishTrack(localTrack);
      localTrack.stop();
      setLocalTrack(null);
      setIsRecording(false);
      toast({ title: 'Mic Off', status: 'info', duration: 2000 });
      console.log('[AUDIO DEBUG] unpublish result', {
        publications: Array.from(room.localParticipant.tracks).map((p) => ({
          id: p.trackSid || p.track?.id || p.sid,
          kind: p.track?.kind,
          muted: p.muted,
          subscribed: p.isSubscribed,
        })),
      });
    }
  }, [room, localTrack, toast]);

  const sendMessage = useCallback(async (message) => {
    if (room) {
      const encoder = new TextEncoder();
      const payload = encoder.encode(message);
      await room.localParticipant.publishData(payload, { reliable: true });
      setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    }
  }, [room]);

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return { room, connectToRoom, startRecording, stopRecording, sendMessage, messages, isConnecting, isRecording, remoteTrack };
};