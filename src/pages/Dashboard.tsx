import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  CreditCard,
  Target,
  FolderOpen,
  Repeat,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { analyticsApi, transactionApi } from "@/services/transactService";

interface DashboardMetrics {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  savings_rate: number;
  transaction_count: number;
  expense_change_percent: number;
  top_category?: {
    name: string;
    total: number;
    color: string;
  };
}

interface ExpenseByCategory {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

interface ExpenseOverTime {
  month: string;
  income: number;
  expenses: number;
}

interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: {
    name: string;
    color: string;
  };
  date: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);
  const [expensesOverTime, setExpensesOverTime] = useState<ExpenseOverTime[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Fetch metrics
      const metricsRes = await analyticsApi.getDashboard(month, year);
      setMetrics(metricsRes.data.data);

      // Fetch expenses by category
      const categoryRes = await analyticsApi.getExpensesByCategory(month, year);
      setExpensesByCategory(categoryRes.data.data.data || []);

      // Fetch expenses over time (last 6 months)
      const timeRes = await analyticsApi.getExpensesOverTime(6);
      setExpensesOverTime(timeRes.data.data || []);

      // Fetch recent transactions
      const transactionsRes = await transactionApi.getRecent(5);
      setRecentTransactions(transactionsRes.data.data || []);

    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.response?.data?.error?.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Balance",
      value: `$${metrics?.net_savings.toFixed(2) || '0.00'}`,
      change: `${metrics?.savings_rate.toFixed(1) || 0}%`,
      positive: (metrics?.net_savings || 0) >= 0,
      icon: Wallet,
    },
    {
      title: "Income",
      value: `$${metrics?.total_income.toFixed(2) || '0.00'}`,
      change: "+0.0%",
      positive: true,
      icon: TrendingUp,
    },
    {
      title: "Expenses",
      value: `$${metrics?.total_expenses.toFixed(2) || '0.00'}`,
      change: `${metrics?.expense_change_percent.toFixed(1) || 0}%`,
      positive: (metrics?.expense_change_percent || 0) < 0,
      icon: CreditCard,
    },
    {
      title: "Savings Rate",
      value: `${metrics?.savings_rate.toFixed(1) || 0}%`,
      change: `${metrics?.transaction_count || 0} transactions`,
      positive: true,
      icon: Target,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your financial overview.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/categories">
          <Button variant="outline" className="w-full h-20 glass-card hover:shadow-glow transition-all group">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold">Manage Categories</div>
                <div className="text-xs text-muted-foreground">Organize your transactions</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to="/budgets">
          <Button variant="outline" className="w-full h-20 glass-card hover:shadow-glow transition-all group">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold">Budgets</div>
                <div className="text-xs text-muted-foreground">Track spending limits</div>
              </div>
            </div>
          </Button>
        </Link>
        <Link to="/recurring">
          <Button variant="outline" className="w-full h-20 glass-card hover:shadow-glow transition-all group">
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold">Recurring</div>
                <div className="text-xs text-muted-foreground">Manage subscriptions</div>
              </div>
            </div>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card
            key={stat.title}
            className="glass-card shadow-card hover:shadow-glow transition-all duration-300 group animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.positive ? (
                  <ArrowUpRight className="w-3 h-3 text-success mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-destructive mr-1" />
                )}
                <span className={stat.positive ? "text-success" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <Card className="glass-card shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesOverTime.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No data available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={expensesOverTime}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(142, 76%, 45%)"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(0, 72%, 51%)"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No expenses yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {expensesByCategory.slice(0, 5).map((category) => (
                    <div key={category.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.category}</span>
                      </div>
                      <span className="font-medium">${category.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link to="/transactions">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
              <Link to="/transactions">
                <Button className="mt-4" variant="outline">
                  Add your first transaction
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "income" ? "bg-success/20" : "bg-destructive/20"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.type === "income" ? "text-success" : "text-foreground"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}