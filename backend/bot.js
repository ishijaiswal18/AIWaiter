const { Room, RoomEvent, RemoteParticipant, RemoteTrack, RemoteTrackPublication } = require('livekit-server-sdk');
const { AccessToken } = require('livekit-server-sdk');
require('dotenv').config();

const roomName = 'ai-waiter-room';
const botParticipantName = 'ai-waiter';

const connectToRoom = async () => {
  const room = new Room();

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: botParticipantName,
  });
  at.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe:true });

  await room.connect('ws://localhost:7880', at.toJwt());

  console.log('AI waiter connected to room:', room.name);

  room.on(RoomEvent.ParticipantConnected, (participant) => {
    console.log('Participant connected:', participant.identity);
  });

  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    console.log('Track subscribed:', track.sid, 'from participant:', participant.identity);
    // We will handle the audio here
  });
};

connectToRoom();