
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders'; // Assuming the backend runs on port 5000

// This endpoint does not exist yet, I will add it to the backend later.
export const getOrders = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const createOrder = async (order) => {
  try {
    const response = await axios.post(API_URL, order);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
