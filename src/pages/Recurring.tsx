import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Calendar, Repeat, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recurringApi, categoryApi } from "@/services/transactService";

interface RecurringTransaction {
  id: string;
  category_id: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  type: "income" | "expense";
  amount: number;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date?: string;
  next_occurrence: string;
  is_active: boolean;
  last_processed?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export default function Recurring() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category_id: "",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  // Fetch recurring transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await recurringApi.getAll();
      setTransactions(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error fetching recurring transactions",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.response?.data?.error?.message || "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const data = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: formData.category_id,
        frequency: formData.frequency,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
      };

      if (editingTransaction) {
        await recurringApi.update(editingTransaction.id, data);
        toast({ title: "Recurring transaction updated" });
      } else {
        await recurringApi.create(data);
        toast({ title: "Recurring transaction created" });
      }

      setIsDialogOpen(false);
      setEditingTransaction(null);
      setFormData({ 
        description: "", 
        amount: "", 
        type: "expense", 
        category_id: "",
        frequency: "monthly", 
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
      });
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error saving transaction",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category_id: transaction.category_id,
      frequency: transaction.frequency,
      start_date: transaction.start_date,
      end_date: transaction.end_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring transaction?")) return;

    try {
      await recurringApi.delete(id);
      toast({ title: "Recurring transaction deleted" });
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error deleting transaction",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await recurringApi.toggleStatus(id);
      toast({ title: "Status updated" });
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const activeTransactions = transactions.filter(t => t.is_active);
  const monthlyTotal = activeTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => {
      const multiplier = 
        t.frequency === "daily" ? 30 :
        t.frequency === "weekly" ? 4 :
        t.frequency === "yearly" ? 1/12 : 1;
      return sum + (t.amount * multiplier);
    }, 0);

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">Manage your subscriptions and regular payments</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-glow" onClick={() => {
              setEditingTransaction(null);
              setFormData({ 
                description: "", 
                amount: "", 
                type: "expense", 
                category_id: "",
                frequency: "monthly", 
                start_date: new Date().toISOString().split('T')[0],
                end_date: "",
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit" : "Create"} Recurring Transaction</DialogTitle>
              <DialogDescription>
                Set up automatic transaction tracking
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Netflix Subscription"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => 
                    setFormData({ ...formData, type: value, category_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No {formData.type} categories available
                      </div>
                    ) : (
                      filteredCategories.map(cat => (
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
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value: any) => 
                    setFormData({ ...formData, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for ongoing recurring transaction
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={!formData.category_id}>
                {editingTransaction ? "Update" : "Create"} Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Cost Summary */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Monthly Recurring Costs</CardTitle>
          <CardDescription>Estimated total recurring expenses per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">${monthlyTotal.toFixed(2)}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {activeTransactions.filter(t => t.type === 'expense').length} active recurring expenses
          </p>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card className="glass-card shadow-card">
          <CardContent className="py-12 text-center">
            <Repeat className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No recurring transactions yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first recurring transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="glass-card shadow-card hover:shadow-glow transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 flex items-start gap-4">
                    {/* Category Color Indicator */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${transaction.category.color}20` }}
                    >
                      <Repeat className="w-5 h-5" style={{ color: transaction.category.color }} />
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{transaction.description}</h3>
                        <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                          {transaction.type}
                        </Badge>
                        <Badge variant="outline" style={{ 
                          borderColor: transaction.category.color,
                          color: transaction.category.color 
                        }}>
                          {transaction.category.name}
                        </Badge>
                        {!transaction.is_active && (
                          <Badge variant="outline" className="bg-muted">
                            Paused
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Next: {new Date(transaction.next_occurrence).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Repeat className="w-4 h-4" />
                          <span className="capitalize">{transaction.frequency}</span>
                        </div>
                        {transaction.last_processed && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Last: {new Date(transaction.last_processed).toLocaleDateString()}</span>
                          </div>
                        )}
                        {transaction.end_date && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <Calendar className="w-4 h-4" />
                            <span>Ends: {new Date(transaction.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Amount Display */}
                      <div className={`mt-3 text-xl font-semibold ${
                        transaction.type === "income" ? "text-success" : "text-foreground"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`switch-${transaction.id}`} className="text-sm text-muted-foreground sr-only">
                        Toggle active
                      </Label>
                      <Switch
                        id={`switch-${transaction.id}`}
                        checked={transaction.is_active}
                        onCheckedChange={() => handleToggle(transaction.id)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active vs Inactive Summary */}
      {transactions.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {activeTransactions.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Currently processing automatically
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paused Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {transactions.length - activeTransactions.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Temporarily disabled
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}