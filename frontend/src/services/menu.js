
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/menu'; // Assuming the backend runs on port 5000

export const getMenu = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data; // The actual data is in response.data.data
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};
