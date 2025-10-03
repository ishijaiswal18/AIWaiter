const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const config = require('./utils/config');
const { log, error } = require('./utils/logger'); // Import logger

// Import Routes
const healthRoutes = require('./views/healthRoutes');
const orderRoutes = require('./views/orderRoutes');
const menuRoutes = require('./views/menuRoutes');
const userRoutes = require('./views/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const createToken = async (roomName, participantName) => {

  const at = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
      identity: participantName,
    });

  at.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true });


  return at.toJwt();
};

// LiveKit Token Generation
app.post('/get-token',  async (req, res) => {
  const { roomName, participantName } = req.body;

  if (!roomName || !participantName) {
    error('Missing roomName or participantName for LiveKit token generation');
    return res.status(400).json({ error: 'Missing roomName or participantName' });
  }
  console.log(config.livekit.apiKey, config.livekit.apiSecret);

  try {
    
    const token = await createToken(roomName, participantName);

    log(`Generated LiveKit token for ${participantName} in room ${roomName}`);
    log("token : ", token);
    res.json({ token: token });
  } catch (err) {
    error(`Error generating LiveKit token: ${err.message}`);
    res.status(500).json({ error: 'Failed to generate LiveKit token' });
  }
});

// Use Routes
app.use('/health', healthRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
    error(`Unhandled error: ${err.stack}`);
    res.status(500).send('Something broke!');
});

module.exports = app;