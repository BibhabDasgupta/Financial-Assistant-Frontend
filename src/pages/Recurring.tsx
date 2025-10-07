import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, Calendar, Repeat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDate: string;
  active: boolean;
}

export default function Recurring() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([
    { id: "1", name: "Netflix Subscription", amount: 15.99, type: "expense", frequency: "monthly", nextDate: "2025-11-05", active: true },
    { id: "2", name: "Salary", amount: 5000, type: "income", frequency: "monthly", nextDate: "2025-11-01", active: true },
    { id: "3", name: "Spotify Premium", amount: 9.99, type: "expense", frequency: "monthly", nextDate: "2025-11-10", active: true },
    { id: "4", name: "Gym Membership", amount: 50, type: "expense", frequency: "monthly", nextDate: "2025-11-15", active: false },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "expense" as "income" | "expense",
    frequency: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
    nextDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTransaction) {
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id 
          ? { ...t, ...formData, amount: Number(formData.amount) }
          : t
      ));
      toast({ title: "Recurring transaction updated" });
    } else {
      const newTransaction: RecurringTransaction = {
        id: Date.now().toString(),
        name: formData.name,
        amount: Number(formData.amount),
        type: formData.type,
        frequency: formData.frequency,
        nextDate: formData.nextDate,
        active: true,
      };
      setTransactions([...transactions, newTransaction]);
      toast({ title: "Recurring transaction created" });
    }

    setIsDialogOpen(false);
    setEditingTransaction(null);
    setFormData({ name: "", amount: "", type: "expense", frequency: "monthly", nextDate: "" });
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormData({
      name: transaction.name,
      amount: transaction.amount.toString(),
      type: transaction.type,
      frequency: transaction.frequency,
      nextDate: transaction.nextDate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({ title: "Recurring transaction deleted", variant: "destructive" });
  };

  const handleToggle = (id: string) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, active: !t.active } : t
    ));
    toast({ title: "Status updated" });
  };

  const activeTransactions = transactions.filter(t => t.active);
  const monthlyTotal = activeTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => {
      const multiplier = 
        t.frequency === "daily" ? 30 :
        t.frequency === "weekly" ? 4 :
        t.frequency === "yearly" ? 1/12 : 1;
      return sum + (t.amount * multiplier);
    }, 0);

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
              setFormData({ name: "", amount: "", type: "expense", frequency: "monthly", nextDate: "" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit" : "Create"} Recurring Transaction</DialogTitle>
              <DialogDescription>
                Set up automatic transaction tracking
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix Subscription"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
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
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "income" | "expense") => 
                    setFormData({ ...formData, type: value })
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
                <Label htmlFor="nextDate">Next Payment Date</Label>
                <Input
                  id="nextDate"
                  type="date"
                  value={formData.nextDate}
                  onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTransaction ? "Update" : "Create"} Transaction
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Monthly Subscription Cost</CardTitle>
          <CardDescription>Total recurring expenses per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${monthlyTotal.toFixed(2)}</div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="glass-card shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Repeat className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{transaction.name}</h3>
                    <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                      {transaction.type}
                    </Badge>
                    {!transaction.active && (
                      <Badge variant="outline">Paused</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground ml-8">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Next: {new Date(transaction.nextDate).toLocaleDateString()}
                    </div>
                    <div>
                      Every {transaction.frequency === "monthly" ? "month" : transaction.frequency}
                    </div>
                    <div className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-foreground"}`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={transaction.active}
                    onCheckedChange={() => handleToggle(transaction.id)}
                  />
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
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
