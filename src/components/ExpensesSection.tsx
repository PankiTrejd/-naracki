import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Expense } from "@/types/expense";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import { PlusCircle, History, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface ExpensesSectionProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id" | "timestamp">) => void;
  onDeleteExpense: (id: string) => void;
  compact?: boolean;
}

const ExpensesSection = ({ expenses, onAddExpense, onDeleteExpense }: ExpensesSectionProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: format(new Date(), "yyyy-MM-dd"),
      notes: newExpense.notes,
    });
    setNewExpense({ description: "", amount: "", notes: "" });
    setIsAddDialogOpen(false);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Трошоци</CardTitle>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Внеси Трошок
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Внеси нов трошок</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Каков Трошок?</Label>
                  <Input
                    id="description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Цена (ден.)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Забелешки</Label>
                  <Input
                    id="notes"
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">Додади</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <History className="h-4 w-4" />
                Историја на трошоци
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Историја на трошоци</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {expenses.filter(Boolean).map((expense) => {
                    if (!expense || typeof expense.id === 'undefined') {
                      console.warn('Skipping invalid expense object:', expense);
                      return null;
                    }

                    const formattedDate = expense.timestamp
                      ? format(new Date(expense.timestamp), "dd MMMM yyyy - HH:mm", { locale: mk })
                      : 'N/A';

                    // Calculate if deletable (30 minutes)
                    const createdAt = new Date(expense.timestamp);
                    const now = new Date();
                    const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
                    const isDeletable = minutesPassed <= 30;

                    return (
                      <Card key={expense.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{expense.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formattedDate}
                              </p>
                              {expense.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{expense.notes}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-lg font-semibold mb-2">
                                    {(typeof expense.amount === 'number' ? expense.amount : 0).toLocaleString()} ден.
                                </div>
                                {isDeletable && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDeleteExpense(expense.id)}
                                        className="h-7 px-2"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Избриши
                                    </Button>
                                )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} ден.</div>
        <p className="text-xs text-muted-foreground">
          Вкупни трошоци за месецот
        </p>
      </CardContent>
    </Card>
  );
};

export default ExpensesSection; 