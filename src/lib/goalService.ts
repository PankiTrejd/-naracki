import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Goal {
  id: string;
  name: string;
  goal_amount: number;
  current_amount: number;
  image_url: string;
}

// Helper function to parse numerical fields for goals
const parseGoalNumerics = (goal: any) => ({
  ...goal,
  goal_amount: parseFloat(goal.goal_amount || '0'),
  current_amount: parseFloat(goal.current_amount || '0'),
});

export const getGoal = async (): Promise<Goal | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/goals`);
    return response.data ? parseGoalNumerics(response.data) : null;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw error;
  }
};

export const updateGoal = async (goal: Partial<Goal> & { id: string }): Promise<Goal | null> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/goals/${goal.id}`, {
      ...goal,
      goal_amount: goal.goal_amount !== undefined ? parseFloat(String(goal.goal_amount)) : undefined,
      current_amount: goal.current_amount !== undefined ? parseFloat(String(goal.current_amount)) : undefined,
    });
    return response.data ? parseGoalNumerics(response.data) : null;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const addToGoal = async (id: string, amount: number): Promise<Goal | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/goals/${id}/add`, { amount: parseFloat(String(amount)) });
    return response.data ? parseGoalNumerics(response.data) : null;
  } catch (error) {
    console.error('Error adding to goal:', error);
    throw error;
  }
};

export const setGoal = async (goalData: { amount: number }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/goals`, { amount: parseFloat(String(goalData.amount)) });
    return parseGoalNumerics(response.data);
  } catch (error) {
    console.error('Error setting goal:', error);
    throw error;
  }
}; 