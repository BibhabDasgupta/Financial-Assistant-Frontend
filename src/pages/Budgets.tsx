import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, AlertCircle, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { budgetApi, categoryApi } from "@/services/transactService";

// Helper function to safely convert to number
const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value) || 0;
  return 0;
};

interface Budget {
  id: string;
  category_id: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  amount: number | string;
  spent: number | string;
  remaining: number | string;
  percentage: number | string;
  month: number;
  year: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export default function Budgets() {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
  });

  const currentMonthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetApi.getProgress(selectedMonth, selectedYear);
      setBudgets(response.data.data || []);
    } catch (error: any) {
      console.error('Fetch budgets error:', error);
      toast({
        title: "Error fetching budgets",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch expense categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll('expense');
      setCategories(response.data.data || []);
    } catch (error: any) {
      console.error('Fetch categories error:', error);
      toast({
        title: "Error fetching categories",
        description: error.response?.data?.error?.message || "Failed to load categories",
        variant: "destructive",
      });
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id || !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const data = {
        category_id: formData.category_id,
        amount: parseFloat(formData.amount),
        month: selectedMonth,
        year: selectedYear,
      };

      if (editingBudget) {
        await budgetApi.update(editingBudget.id, { amount: data.amount });
        toast({ title: "Budget updated successfully" });
      } else {
        await budgetApi.create(data);
        toast({ title: "Budget created successfully" });
      }

      setIsDialogOpen(false);
      setEditingBudget(null);
      setFormData({ category_id: "", amount: "" });
      fetchBudgets();
    } catch (error: any) {
      toast({
        title: "Error saving budget",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category_id: budget.category_id,
      amount: toNumber(budget.amount).toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      await budgetApi.delete(id);
      toast({ title: "Budget deleted successfully" });
      fetchBudgets();
    } catch (error: any) {
      toast({
        title: "Error deleting budget",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + toNumber(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + toNumber(b.spent), 0);

  // Month options
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits for {currentMonthName}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[130px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedYear.toString()} 
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow" onClick={() => {
                setEditingBudget(null);
                setFormData({ category_id: "", amount: "" });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>{editingBudget ? "Edit" : "Create"} Budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for {currentMonthName}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    disabled={!!editingBudget}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No expense categories available
                        </div>
                      ) : (
                        categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                              />
                              <span>{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!formData.category_id}>
                  {editingBudget ? "Update" : "Create"} Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
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
            <div className="text-2xl font-bold text-destructive">${totalSpent.toFixed(2)}</div>
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

      {/* Budget List */}
      {budgets.length === 0 ? (
        <Card className="glass-card shadow-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No budgets set for this month</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {budgets.map((budget) => {
            const amount = toNumber(budget.amount);
            const spent = toNumber(budget.spent);
            const remaining = toNumber(budget.remaining);
            const percentage = toNumber(budget.percentage);
            const isOverBudget = percentage >= 100;
            const isNearLimit = percentage >= 80 && percentage < 100;
            
            return (
              <Card key={budget.id} className="glass-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${budget.category.color}20` }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: budget.category.color }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{budget.category.name}</h3>
                          {isOverBudget && (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${spent.toFixed(2)} of ${amount.toFixed(2)} spent
                        </p>
                      </div>
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
                      <span className={`font-medium ${
                        isOverBudget ? 'text-destructive' : 
                        isNearLimit ? 'text-amber-500' : 
                        'text-muted-foreground'
                      }`}>
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className={isOverBudget ? "text-destructive font-medium" : ""}>
                        ${remaining.toFixed(2)} remaining
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2"
                    />
                    {isOverBudget && (
                      <p className="text-xs text-destructive mt-2">
                        ⚠️ You've exceeded this budget by ${Math.abs(remaining).toFixed(2)}
                      </p>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ You're approaching your budget limit
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}