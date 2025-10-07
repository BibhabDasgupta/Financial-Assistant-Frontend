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

const statsData = [
  {
    title: "Total Balance",
    value: "$12,543.90",
    change: "+12.5%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "Income",
    value: "$5,240.00",
    change: "+8.2%",
    positive: true,
    icon: TrendingUp,
  },
  {
    title: "Expenses",
    value: "$3,124.50",
    change: "-3.1%",
    positive: true,
    icon: CreditCard,
  },
  {
    title: "Savings",
    value: "$2,118.40",
    change: "+15.3%",
    positive: true,
    icon: Target,
  },
];

const chartData = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 2000, expenses: 3800 },
  { month: "Apr", income: 2780, expenses: 3908 },
  { month: "May", income: 1890, expenses: 4800 },
  { month: "Jun", income: 5240, expenses: 3124 },
];

const categoryData = [
  { name: "Food", value: 850, color: "hsl(263, 70%, 60%)" },
  { name: "Transport", value: 420, color: "hsl(142, 76%, 45%)" },
  { name: "Entertainment", value: 320, color: "hsl(200, 70%, 60%)" },
  { name: "Shopping", value: 680, color: "hsl(280, 70%, 60%)" },
  { name: "Bills", value: 854, color: "hsl(0, 72%, 51%)" },
];

export default function Dashboard() {
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
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
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
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-medium">${category.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Grocery Store", amount: -85.32, category: "Food", date: "Today" },
              { name: "Salary Deposit", amount: 5240.0, category: "Income", date: "Yesterday" },
              { name: "Netflix", amount: -15.99, category: "Entertainment", date: "2 days ago" },
              { name: "Uber", amount: -24.5, category: "Transport", date: "3 days ago" },
            ].map((transaction, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? "bg-success/20" : "bg-destructive/20"
                    }`}
                  >
                    {transaction.amount > 0 ? (
                      <ArrowUpRight className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.name}</div>
                    <div className="text-sm text-muted-foreground">{transaction.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      transaction.amount > 0 ? "text-success" : "text-foreground"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">{transaction.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
