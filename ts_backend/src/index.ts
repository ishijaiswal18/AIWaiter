
import app from './app';
import logger from './utils/logger';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 5001; // Use 5001 to avoid conflict with original backend

app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
});
