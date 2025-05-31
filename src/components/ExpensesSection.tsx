import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Expense } from "@/types/expense";
import { format } from "date-fns";
import { mk } from "date-fns/locale";
import { PlusCircle, History } from "lucide-react";
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
}

const ExpensesSection = ({ expenses, onAddExpense }: ExpensesSectionProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: "",
    cost: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      name: newExpense.name,
      cost: parseFloat(newExpense.cost),
      notes: newExpense.notes,
    });
    setNewExpense({ name: "", cost: "", notes: "" });
    setIsAddDialogOpen(false);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.cost, 0);

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
                  <Label htmlFor="name">Каков Трошок?</Label>
                  <Input
                    id="name"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Цена (ден.)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.cost}
                    onChange={(e) => setNewExpense({ ...newExpense, cost: e.target.value })}
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
                  {expenses.map((expense) => (
                    <Card key={expense.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{expense.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(expense.timestamp), "dd MMMM yyyy - HH:mm", { locale: mk })}
                            </p>
                            {expense.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{expense.notes}</p>
                            )}
                          </div>
                          <div className="text-lg font-semibold">
                            {expense.cost.toLocaleString()} ден.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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