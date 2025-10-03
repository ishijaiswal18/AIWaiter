require('dotenv').config();

const config = {
    port: process.env.PORT || 5000,
    livekit: {
        apiKey: process.env.LIVEKIT_API_KEY,
        apiSecret: process.env.LIVEKIT_API_SECRET,
    },
    // Add other configurations here
};

module.exports = config;