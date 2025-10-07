import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyticsApi } from "@/services/transactService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  biggest_expense?: {
    description: string;
    amount: number;
    date: string;
  };
}

interface ExpenseByCategory {
  category: string;
  amount: number;
  color: string;
  percentage: number;
  count: number;
}

interface ExpenseOverTime {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface IncomeVsExpenses {
  income: number;
  expenses: number;
  difference: number;
}

export default function Analytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState<number>(6);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([]);
  const [expensesOverTime, setExpensesOverTime] = useState<ExpenseOverTime[]>([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<IncomeVsExpenses | null>(null);

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch dashboard metrics
      const metricsRes = await analyticsApi.getDashboard(selectedMonth, selectedYear);
      setMetrics(metricsRes.data.data);

      // Fetch expenses by category
      const categoryRes = await analyticsApi.getExpensesByCategory(selectedMonth, selectedYear);
      setExpensesByCategory(categoryRes.data.data.data || []);

      // Fetch expenses over time
      const timeRes = await analyticsApi.getExpensesOverTime(selectedMonths);
      setExpensesOverTime(timeRes.data.data || []);

      // Fetch income vs expenses
      const comparisonRes = await analyticsApi.getIncomeVsExpenses(selectedMonth, selectedYear);
      setIncomeVsExpenses(comparisonRes.data.data);

    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.response?.data?.error?.message || "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear, selectedMonths]);

  // Generate month options
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

  // Generate year options (current year and 2 years back)
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
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your financial patterns and trends
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
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
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ${metrics?.total_income.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${metrics?.total_expenses.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(metrics?.net_savings || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${metrics?.net_savings.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics?.savings_rate.toFixed(1) || '0.0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview Chart */}
      <Card className="glass-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expense Trends (Last {selectedMonths} Months)</CardTitle>
          <Select 
            value={selectedMonths.toString()} 
            onValueChange={(value) => setSelectedMonths(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {expensesOverTime.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              <p>No data available for the selected period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={expensesOverTime}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="hsl(142, 76%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(142, 76%, 45%)" }}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(0, 72%, 51%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(0, 72%, 51%)" }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  stroke="hsl(263, 70%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(263, 70%, 60%)" }}
                  name="Net Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown - Bar Chart */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No expense data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[8, 8, 0, 0]}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown - Pie Chart */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No expense data available</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
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
                      formatter={(value: any) => `$${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 max-h-[100px] overflow-y-auto">
                  {expensesByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">${category.amount.toFixed(2)}</span>
                        <span className="text-muted-foreground text-xs">
                          ({category.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Insights */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Savings Insight */}
          {metrics && metrics.net_savings > 0 && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-semibold text-success mb-1">Great Progress!</h4>
                  <p className="text-sm text-muted-foreground">
                    You saved ${metrics.net_savings.toFixed(2)} this month, which is {metrics.savings_rate.toFixed(1)}% of your income.
                    {metrics.expense_change_percent < 0 && ` Your expenses decreased by ${Math.abs(metrics.expense_change_percent).toFixed(1)}% compared to last month.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Category Spending */}
          {metrics?.top_category && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary mb-1">Top Spending Category</h4>
                  <p className="text-sm text-muted-foreground">
                    You spent the most on <strong>{metrics.top_category.name}</strong> this month: ${metrics.top_category.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expense Increase Warning */}
          {metrics && metrics.expense_change_percent > 10 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-semibold text-destructive mb-1">Attention Needed</h4>
                  <p className="text-sm text-muted-foreground">
                    Your expenses increased by {metrics.expense_change_percent.toFixed(1)}% compared to last month. 
                    Consider reviewing your spending habits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Biggest Expense */}
          {metrics?.biggest_expense && (
            <div className="p-4 rounded-lg bg-accent border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Biggest Single Expense</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>{metrics.biggest_expense.description}</strong> - ${metrics.biggest_expense.amount.toFixed(2)} on {new Date(metrics.biggest_expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No data message */}
          {!metrics?.top_category && !metrics?.biggest_expense && metrics?.transaction_count === 0 && (
            <div className="p-4 rounded-lg bg-accent border border-border text-center">
              <p className="text-sm text-muted-foreground">
                No transactions yet for this period. Start adding transactions to see insights!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income vs Expenses Comparison */}
      {incomeVsExpenses && (
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Income vs Expenses Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="text-sm text-muted-foreground mb-1">Total Income</div>
                <div className="text-2xl font-bold text-success">
                  ${incomeVsExpenses.income.toFixed(2)}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
                <div className="text-2xl font-bold text-destructive">
                  ${incomeVsExpenses.expenses.toFixed(2)}
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                incomeVsExpenses.difference >= 0 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'bg-destructive/10 border-destructive/20'
              }`}>
                <div className="text-sm text-muted-foreground mb-1">Difference</div>
                <div className={`text-2xl font-bold ${
                  incomeVsExpenses.difference >= 0 ? 'text-primary' : 'text-destructive'
                }`}>
                  {incomeVsExpenses.difference >= 0 ? '+' : ''}${incomeVsExpenses.difference.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}