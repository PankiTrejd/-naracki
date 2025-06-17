import { Router, Request, Response } from 'express';
import { db } from '../server.js';

const router = Router();

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // Assuming date is passed as a string (e.g., YYYY-MM-DD)
  timestamp?: string;
  notes: string;
}

// Get all expenses
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await db.any(
      `SELECT id, description, amount, date, timestamp FROM expenses ORDER BY timestamp DESC`,
    );
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Error fetching expenses", error: error.message });
  }
});

// Add a new expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const expense: Omit<Expense, "id" | "timestamp"> = req.body;
    const newExpense = await db.one(
      `INSERT INTO expenses(description, amount, date, timestamp, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        expense.description,
        expense.amount,
        expense.date,
        new Date().toISOString(),
        expense.notes,
      ],
    );
    res.status(201).json(newExpense);
  } catch (error: any) {
    console.error("Error adding expense:", error.message || error);
    res.status(500).json({ message: "Error adding expense", error: error.message || error });
  }
});

// Delete an expense by ID within 30 minutes of creation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch the expense to check its timestamp
    const expense = await db.oneOrNone(
      `SELECT id, timestamp FROM expenses WHERE id = $1`,
      [id]
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    const createdAt = new Date(expense.timestamp);
    const now = new Date();
    const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (minutesPassed > 30) {
      return res.status(403).json({ message: "Expense can only be deleted within 30 minutes of creation." });
    }

    // Delete the expense from the database
    await db.none(
      `DELETE FROM expenses WHERE id = $1`,
      [id]
    );

    res.status(200).json({ message: `Expense ${id} deleted successfully.` });

  } catch (error: any) {
    console.error("Error deleting expense:", error.message || error);
    res.status(500).json({ message: "Error deleting expense", error: error.message || error });
  }
});

export default router; 