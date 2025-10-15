import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, RemoteAudioTrack, createLocalAudioTrack } from 'livekit-client';
import { useNavigate } from 'react-router-dom';

// Prefer using env var VITE_LIVEKIT_TOKEN_URL, fallback to JS backend on 5000
const TOKEN_URL = 'http://localhost:5000/get-token';
const LIVEKIT_URL = 'wss://ai-waiter-c5qys2gz.livekit.cloud';

export const useLiveKit = (cart, toast) => {
  const [roomState, setRoomState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [localTrack, setLocalTrack] = useState(null);
  const [remoteTrack, setRemoteTrack] = useState(null);
  const navigate = useNavigate();
  const roomRef = useRef(null);

  const getToken = useCallback(async (roomName, participantName) => {
    try {
      const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName, participantName }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Token endpoint returned ${response.status}: ${text}`);
      }
      const data = await response.json().catch(() => null);
      if (!data || !data.token) throw new Error('Token not present in response');
      return data.token;
    } catch (error) {
      console.error('[LiveKit] Error fetching token', error);
      toast({
        title: 'Error fetching token',
        description: error.message,
        status: 'error',
        duration: 8000,
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

  const connectToRoom = useCallback(async (roomName = 'lobby', participantName = `guest_${Math.floor(Math.random()*10000)}`) => {
    setIsConnecting(true);
    try {
      console.log('[LiveKit] requesting token for', { roomName, participantName });
      const token = await getToken(roomName, participantName);
      if (!token) return;

      // create Room instance once
      if (!roomRef.current) roomRef.current = new Room();
      const r = roomRef.current;

      await r.connect(LIVEKIT_URL, token);
      setRoomState(r);

      r.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
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

      r.on(RoomEvent.DataReceived, (payload, participant) => {
        const decoder = new TextDecoder();
        const messageStr = decoder.decode(payload);
        try {
          const message = JSON.parse(messageStr);
          if (message.type === 'command') {
            handleCommand(message);
          } else {
            setMessages((prev) => [...prev, { text: message.text, sender: participant.identity }]);
          }
        } catch (err) {
          console.warn('[LiveKit] failed to parse data message', { err, messageStr });
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
  }, [getToken, handleCommand, toast]);

  const startRecording = useCallback(async () => {
    console.log('[AUDIO DEBUG] Start clicked');
    const r = roomRef.current;
    if (r) {
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
        console.log('[AUDIO DEBUG] localParticipant', r.localParticipant);
        // publish on the room reference
        await r.localParticipant.publishTrack(localAudioTrack);
        // Helper: safely extract publications from a participant-like object
        const getParticipantPublications = (participant) => {
          let pubs = [];
          try {
            const audioTracksMap = participant?.audioTracks;
            if (audioTracksMap && typeof audioTracksMap.values === 'function') {
              pubs = Array.from(audioTracksMap.values());
            } else if (participant?.tracks && typeof participant.tracks[Symbol.iterator] === 'function') {
              // participant.tracks may be a Map or array-like [key, value]
              pubs = Array.from(participant.tracks).map((t) => t[1] || t);
            }
          } catch (err) {
            console.warn('[AUDIO DEBUG] could not read publications from participant', err, participant);
          }
          return pubs;
        };

        const publicationsArr = getParticipantPublications(r.localParticipant);
        console.log('[AUDIO DEBUG] publish result', {
          publications: publicationsArr.map((p) => ({
            id: p?.trackSid || p?.track?.id || p?.sid,
            kind: p?.track?.kind,
            muted: p?.muted,
            subscribed: p?.isSubscribed,
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
    } else {
      toast({ title: 'Not connected to room', description: 'Connect to a LiveKit room first', status: 'warning', duration: 4000 });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    console.log('[AUDIO DEBUG] Stop clicked');
    const r = roomRef.current;
    if (r && localTrack) {
      try {
        r.localParticipant.unpublishTrack(localTrack);
        localTrack.stop();
      } catch (err) {
        console.warn('[AUDIO DEBUG] error unpublishing/stopping local track', err);
      }
      setLocalTrack(null);
      setIsRecording(false);
      toast({ title: 'Mic Off', status: 'info', duration: 2000 });
      console.log('[AUDIO DEBUG] unpublish result', {
        publications: Array.from(r.localParticipant.tracks).map((p) => ({
          id: p.trackSid || p.track?.id || p.sid,
          kind: p.track?.kind,
          muted: p.muted,
          subscribed: p.isSubscribed,
        })),
      });
    }
  }, [localTrack, toast]);

  const sendMessage = useCallback(async (message) => {
    const r = roomRef.current;
    if (r) {
      const encoder = new TextEncoder();
      const payload = encoder.encode(message);
      await r.localParticipant.publishData(payload, { reliable: true });
      setMessages((prev) => [...prev, { text: message, sender: 'user' }]);
    }
  }, []);

  useEffect(() => {
    return () => {
      const r = roomRef.current;
      if (r) {
        try { r.disconnect(); } catch (err) { console.warn('Error disconnecting room', err); }
      }
    };
  }, []);

  return { room: roomState, connectToRoom, startRecording, stopRecording, sendMessage, messages, isConnecting, isRecording, remoteTrack };
};