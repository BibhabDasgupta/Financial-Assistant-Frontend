import { useState } from "react";
import { Plus, Filter, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");

  const transactions = [
    {
      id: 1,
      date: "2025-10-07",
      description: "Whole Foods Market",
      category: "Food",
      amount: -145.32,
      type: "expense",
    },
    {
      id: 2,
      date: "2025-10-06",
      description: "Monthly Salary",
      category: "Income",
      amount: 5240.0,
      type: "income",
    },
    {
      id: 3,
      date: "2025-10-05",
      description: "Netflix Subscription",
      category: "Entertainment",
      amount: -15.99,
      type: "expense",
    },
    {
      id: 4,
      date: "2025-10-05",
      description: "Uber Ride",
      category: "Transport",
      amount: -24.5,
      type: "expense",
    },
    {
      id: 5,
      date: "2025-10-04",
      description: "Freelance Project",
      category: "Income",
      amount: 850.0,
      type: "income",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Button className="gradient-primary shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 hover:shadow-glow cursor-pointer group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="hidden md:block text-sm text-muted-foreground min-w-[100px]">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {transaction.description}
                    </div>
                    <div className="md:hidden text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="hidden md:inline-flex bg-background/50"
                  >
                    {transaction.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold text-lg ${
                      transaction.type === "income" ? "text-success" : "text-foreground"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : ""}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <Badge
                    variant="outline"
                    className="md:hidden mt-1 bg-background/50"
                  >
                    {transaction.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
