import { Router, Request, Response } from 'express';
import { db } from '../server.js';

const router = Router();

interface Goal {
  id: string;
  name: string;
  goal_amount: number;
  current_amount: number;
  image_url: string;
}

// Get goal
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await db.oneOrNone(
      `SELECT id, name, goal_amount, current_amount, image_url FROM goal_tracker`,
    );
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ message: "Error fetching goal", error: error.message });
  }
});

// Update goal
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal: Partial<Goal> = req.body;

    const updatedGoal = await db.oneOrNone(
      `UPDATE goal_tracker SET name = COALESCE($1, name), goal_amount = COALESCE($2, goal_amount), current_amount = COALESCE($3, current_amount), image_url = COALESCE($4, image_url) WHERE id = $5 RETURNING *`,
      [goal.name, goal.goal_amount, goal.current_amount, goal.image_url, id],
    );
    res.status(200).json(updatedGoal);
  } catch (error: any) {
    console.error("Error updating goal:", error);
    res.status(500).json({ message: "Error updating goal", error: error.message });
  }
});

// Add to goal (atomic update)
router.post('/:id/add', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Using a transaction for atomic update
    const updatedGoal = await db.tx(async t => {
      const currentGoal = await t.oneOrNone(
        `SELECT current_amount FROM goal_tracker WHERE id = $1`,
        [id]
      );

      if (!currentGoal) {
        throw new Error("Goal not found");
      }

      const newAmount = parseFloat(currentGoal.current_amount) + parseFloat(amount);

      return t.one(
        `UPDATE goal_tracker SET current_amount = $1 WHERE id = $2 RETURNING *`,
        [newAmount, id]
      );
    });

    res.status(200).json(updatedGoal);
  } catch (error: any) {
    console.error("Error adding to goal:", error);
    res.status(500).json({ message: "Error adding to goal", error: error.message });
  }
});

export default router; 