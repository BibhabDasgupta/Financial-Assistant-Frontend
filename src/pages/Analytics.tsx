import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

const monthlyData = [
  { month: "Jan", income: 4200, expenses: 3100, savings: 1100 },
  { month: "Feb", income: 3800, expenses: 2900, savings: 900 },
  { month: "Mar", income: 4500, expenses: 3400, savings: 1100 },
  { month: "Apr", income: 4100, expenses: 3200, savings: 900 },
  { month: "May", income: 5000, expenses: 3500, savings: 1500 },
  { month: "Jun", income: 5240, expenses: 3124, savings: 2116 },
];

const categoryData = [
  { category: "Food", amount: 850 },
  { category: "Transport", amount: 420 },
  { category: "Entertainment", amount: 320 },
  { category: "Shopping", amount: 680 },
  { category: "Bills", amount: 854 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Deep dive into your financial patterns and trends
        </p>
      </div>

      {/* Monthly Overview */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
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
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(0, 72%, 51%)"
                strokeWidth={2}
                dot={{ fill: "hsl(0, 72%, 51%)" }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="hsl(263, 70%, 60%)"
                strokeWidth={2}
                dot={{ fill: "hsl(263, 70%, 60%)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="amount" fill="hsl(263, 70%, 60%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <h4 className="font-semibold text-success mb-2">Great Progress!</h4>
              <p className="text-sm text-muted-foreground">
                Your savings increased by 15.3% this month compared to last month.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Budget Alert</h4>
              <p className="text-sm text-muted-foreground">
                You've spent 78% of your food budget for this month.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <h4 className="font-semibold text-destructive mb-2">Attention Needed</h4>
              <p className="text-sm text-muted-foreground">
                Entertainment expenses are 25% higher than your average.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
