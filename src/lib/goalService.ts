import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Goal {
  id: string;
  name: string;
  goal_amount: number;
  current_amount: number;
  image_url: string;
}

export const getGoal = async (): Promise<Goal | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/goals`);
    return response.data || null;
  } catch (error: any) {
    console.error("Error fetching goal:", error.response?.data?.message || error.message || error);
    return null;
  }
};

export const updateGoal = async (goal: Partial<Goal> & { id: string }): Promise<Goal | null> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/goals/${goal.id}`, goal);
    return response.data || null;
  } catch (error: any) {
    console.error("Error updating goal:", error.response?.data?.message || error.message || error);
    return null;
  }
};

export const addToGoal = async (id: string, amount: number): Promise<Goal | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/goals/${id}/add`, { amount });
    return response.data || null;
  } catch (error: any) {
    console.error("Error adding to goal:", error.response?.data?.message || error.message || error);
    return null;
  }
};

export const setGoal = async (goalData: { amount: number }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/goals`, goalData);
    return response.data;
  } catch (error) {
    console.error('Error setting goal:', error);
    throw error;
  }
}; 