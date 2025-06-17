import { Expense } from "@/types/expense";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/expenses`);
    return response.data.map((expense: any) => ({
      ...expense,
      amount: parseFloat(expense.amount || '0'),
    })) || [];
  } catch (error: any) {
    console.error("Error fetching expenses:", error.response?.data?.message || error.message || error);
    throw error;
  }
};

export const addExpense = async (expense: Omit<Expense, "id" | "timestamp">): Promise<Expense> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/expenses`, expense);
    return {
      ...response.data,
      amount: parseFloat(response.data.amount || '0'),
    };
  } catch (error: any) {
    console.error("Error adding expense:", error.response?.data?.message || error.message || error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/expenses/${id}`);
  } catch (error: any) {
    console.error("Error deleting expense:", error.response?.data?.message || error.message || error);
    throw error;
  }
}; 