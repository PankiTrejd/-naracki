import { Expense } from "@/types/expense";
import { supabase } from "./supabase";

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }

  return data || [];
};

export const addExpense = async (expense: Omit<Expense, "id" | "timestamp">): Promise<Expense> => {
  const { data, error } = await supabase
    .from("expenses")
    .insert([
      {
        ...expense,
        timestamp: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding expense:", error);
    throw error;
  }

  return data;
}; 