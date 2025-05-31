import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { getGoal, updateGoal, addToGoal, Goal } from "@/lib/goalService";
import { Pencil } from "lucide-react";

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
    return <Card className="w-full mt-6 overflow-x-hidden"><CardContent className="p-6 text-center">Loading...</CardContent></Card>;
  }

  const percent = Math.min(100, (goal.current_amount / goal.goal_amount) * 100);

  return (
    <Card className="w-full mt-6 p-4 sm:p-6 flex flex-col items-center relative overflow-x-hidden">
      {/* Edit pencil icon top right */}
      {!editMode && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 sm:top-4 sm:right-4"
          onClick={handleEdit}
          aria-label="Промени"
        >
          <Pencil className="w-5 h-5" />
        </Button>
      )}
      {/* Image centered */}
      <img
        src={goal.image_url || DEFAULT_IMAGE}
        alt="Goal"
        className="w-24 h-24 object-contain rounded-md border bg-white mx-auto mb-4"
      />
      <div className="flex-1 w-full flex flex-col items-center">
        {editMode ? (
          <div className="flex flex-col gap-2 mb-2 w-full max-w-xs mx-auto">
            <Input value={editName} onChange={e => setEditName(e.target.value)} className="text-center" />
            <Input
              type="number"
              min="1"
              value={editGoalAmount}
              onChange={e => setEditGoalAmount(e.target.value)}
              className="text-center"
            />
            <div className="flex gap-2 mt-2 justify-center">
              <Button size="sm" onClick={handleSave}>Сними</Button>
              <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>Откажи</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-lg font-semibold text-center mb-1">{goal.name}</div>
            <div className="text-sm text-muted-foreground text-center mb-2">Цел: {goal.goal_amount.toLocaleString()} ден.</div>
          </>
        )}
        <div className="flex flex-col items-center w-full mb-2">
          <div className="text-2xl font-bold text-green-700">{goal.current_amount.toLocaleString()} ден.</div>
          <span className="text-muted-foreground">/ {goal.goal_amount.toLocaleString()} ден.</span>
        </div>
        <div className="w-full max-w-full mb-4">
          <Progress value={percent} className="h-6 w-full" />
        </div>
        <div className="w-full max-w-full">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">Додади кон целта</Button>
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Додади</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

export default GoalTracker; 