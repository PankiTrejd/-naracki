import { supabase } from "./supabase";

export interface Goal {
  id: string;
  name: string;
  goal_amount: number;
  current_amount: number;
  image_url: string;
}

export const getGoal = async (): Promise<Goal | null> => {
  const { data, error } = await supabase
    .from("goal_tracker")
    .select("*")
    .single();
  if (error) {
    console.error("Error fetching goal:", error);
    return null;
  }
  return data;
};

export const updateGoal = async (goal: Partial<Goal> & { id: string }): Promise<Goal | null> => {
  const { data, error } = await supabase
    .from("goal_tracker")
    .update(goal)
    .eq("id", goal.id)
    .select()
    .single();
  if (error) {
    console.error("Error updating goal:", error);
    return null;
  }
  return data;
};

export const addToGoal = async (id: string, amount: number): Promise<Goal | null> => {
  // Fetch current goal
  const goal = await getGoal();
  if (!goal) return null;
  const newAmount = goal.current_amount + amount;
  return updateGoal({ id, current_amount: newAmount });
}; 