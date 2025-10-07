import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
}

export default function Budgets() {
  const { toast } = useToast();
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: "1", category: "Groceries", amount: 500, spent: 342, month: currentMonth },
    { id: "2", category: "Transport", amount: 200, spent: 178, month: currentMonth },
    { id: "3", category: "Entertainment", amount: 150, spent: 165, month: currentMonth },
    { id: "4", category: "Utilities", amount: 300, spent: 280, month: currentMonth },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBudget) {
      setBudgets(budgets.map(budget => 
        budget.id === editingBudget.id 
          ? { ...budget, category: formData.category, amount: Number(formData.amount) }
          : budget
      ));
      toast({ title: "Budget updated successfully" });
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        category: formData.category,
        amount: Number(formData.amount),
        spent: 0,
        month: currentMonth,
      };
      setBudgets([...budgets, newBudget]);
      toast({ title: "Budget created successfully" });
    }

    setIsDialogOpen(false);
    setEditingBudget(null);
    setFormData({ category: "", amount: "" });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setBudgets(budgets.filter(budget => budget.id !== id));
    toast({ title: "Budget deleted", variant: "destructive" });
  };

  const getProgressColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-success";
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits for {currentMonth}</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-glow" onClick={() => {
              setEditingBudget(null);
              setFormData({ category: "", amount: "" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Edit" : "Create"} Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for {currentMonth}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Groceries">Groceries</SelectItem>
                    <SelectItem value="Transport">Transport</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingBudget ? "Update" : "Create"} Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-destructive' : 'text-success'}`}>
              ${(totalBudget - totalSpent).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const isOverBudget = percentage >= 100;
          
          return (
            <Card key={budget.id} className="glass-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{budget.category}</h3>
                      {isOverBudget && (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)} spent
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(budget)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {percentage.toFixed(0)}% used
                    </span>
                    <span className={isOverBudget ? "text-destructive font-medium" : ""}>
                      ${(budget.amount - budget.spent).toFixed(2)} remaining
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
