import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { getGoal, updateGoal, addToGoal, Goal } from "@/lib/goalService";

const DEFAULT_IMAGE = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"; // Example static image

const GoalTracker = () => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGoalAmount, setEditGoalAmount] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    setLoading(true);
    const g = await getGoal();
    setGoal(g);
    setLoading(false);
  };

  const handleEdit = () => {
    if (!goal) return;
    setEditName(goal.name);
    setEditGoalAmount(goal.goal_amount.toString());
    setEditMode(true);
  };

  const handleSave = async () => {
    if (!goal) return;
    const updated = await updateGoal({
      id: goal.id,
      name: editName,
      goal_amount: parseFloat(editGoalAmount),
    });
    setGoal(updated);
    setEditMode(false);
  };

  const handleAddToGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !addAmount) return;
    const updated = await addToGoal(goal.id, parseFloat(addAmount));
    setGoal(updated);
    setAddAmount("");
    setAddDialogOpen(false);
  };

  if (loading || !goal) {
    return <Card className="w-full mt-6"><CardContent className="p-6 text-center">Loading...</CardContent></Card>;
  }

  const percent = Math.min(100, (goal.current_amount / goal.goal_amount) * 100);

  return (
    <Card className="w-full mt-6 flex flex-col md:flex-row items-center gap-6 p-6">
      <img
        src={goal.image_url || DEFAULT_IMAGE}
        alt="Goal"
        className="w-24 h-24 object-contain rounded-md border bg-white"
      />
      <div className="flex-1 w-full">
        {editMode ? (
          <div className="flex flex-col gap-2 mb-2">
            <Input value={editName} onChange={e => setEditName(e.target.value)} className="max-w-xs" />
            <Input
              type="number"
              min="1"
              value={editGoalAmount}
              onChange={e => setEditGoalAmount(e.target.value)}
              className="max-w-xs"
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleSave}>Сними</Button>
              <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Откажи</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-2">
            <div className="text-lg font-semibold">{goal.name}</div>
            <div className="text-sm text-muted-foreground">Цел: {goal.goal_amount.toLocaleString()} ден.</div>
            <Button size="sm" variant="ghost" onClick={handleEdit}>Промени</Button>
          </div>
        )}
        <div className="flex items-center gap-4 mb-2">
          <div className="text-xl font-bold text-green-700">{goal.current_amount.toLocaleString()} ден.</div>
          <span className="text-muted-foreground">/ {goal.goal_amount.toLocaleString()} ден.</span>
        </div>
        <Progress value={percent} className="h-4" />
        <div className="flex gap-2 mt-4">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default">Додади кон целта</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Додади кон целта</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddToGoal} className="flex flex-col gap-4">
                <Input
                  type="number"
                  min="1"
                  value={addAmount}
                  onChange={e => setAddAmount(e.target.value)}
                  placeholder="Износ (ден.)"
                  required
                />
                <Button type="submit">Додади</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

export default GoalTracker; 