import axios from 'axios';
import { Expense } from '../types/expense';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/expenses`);
    return response.data.map((expense: any) => ({
      ...expense,
      amount: parseFloat(expense.amount || '0'),
    })) || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const addExpense = async (expenseData: Expense) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/expenses`, { ...expenseData, amount: parseFloat(String(expenseData.amount)) });
    return { ...response.data, amount: parseFloat(response.data.amount || '0') };
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error; 
  }
};

export const deleteExpense = async (id: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
    return response.data; 
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error; 
  }
}; 