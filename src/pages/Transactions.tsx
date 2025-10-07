import { useState, useEffect } from "react";
import { Plus, Filter, Download, Search, Trash2, Edit, X, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { transactionApi, categoryApi, exportApi } from "@/services/transactService";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
}

export default function Transactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    notes: '',
  });

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
        sort_by: 'date',
        sort_order: 'desc',
      };

      if (searchQuery) params.search = searchQuery;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;

      const response = await transactionApi.getAll(params);
      setTransactions(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalCount(response.data.pagination.totalCount);
    } catch (error: any) {
      toast({
        title: "Error fetching transactions",
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
      setCategoriesLoading(true);
      const response = await categoryApi.getAll();
      const fetchedCategories = response.data.data;
      setCategories(fetchedCategories);

      // Auto-select first expense category if none selected
      if (!formData.category_id && fetchedCategories.length > 0) {
        const defaultExpenseCategory = fetchedCategories.find(
          (cat: Category) => cat.type === 'expense'
        );
        if (defaultExpenseCategory) {
          setFormData((prev) => ({
            ...prev,
            category_id: defaultExpenseCategory.id,
          }));
        }
      }
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.response?.data?.error?.message || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchQuery, typeFilter, categoryFilter]);

  // Debug log (remove after testing)
  useEffect(() => {
    console.log('🔍 Debug Info:', {
      totalCategories: categories.length,
      categoriesLoading,
      formType: formData.type,
      filteredCount: categories.filter(cat => cat.type === formData.type).length,
      categoryNames: categories.filter(cat => cat.type === formData.type).map(c => c.name),
      selectedCategoryId: formData.category_id
    });
  }, [categories, formData.type, categoriesLoading, formData.category_id]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingTransaction) {
        await transactionApi.update(editingTransaction.id, data);
        toast({ title: "Transaction updated successfully" });
      } else {
        await transactionApi.create(data);
        toast({ title: "Transaction created successfully" });
      }

      setIsDialogOpen(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error saving transaction",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await transactionApi.delete(id);
      toast({ title: "Transaction deleted successfully" });
      fetchTransactions();
    } catch (error: any) {
      toast({
        title: "Error deleting transaction",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Handle edit
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      category_id: transaction.category.id,
      notes: transaction.notes || '',
    });
    setIsDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    const defaultExpenseCategory = categories.find(cat => cat.type === 'expense');
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category_id: defaultExpenseCategory?.id || '',
      notes: '',
    });
  };

  // Handle opening dialog
  const handleOpenDialog = () => {
    setEditingTransaction(null);
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setExporting(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;

      let response;
      if (format === 'csv') response = await exportApi.toCSV(params);
      else if (format === 'excel') response = await exportApi.toExcel(params);
      else response = await exportApi.toPDF(params);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({ title: `Exported successfully as ${format.toUpperCase()}` });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses</p>
        </div>
        <Button 
          className="gradient-primary shadow-glow"
          onClick={handleOpenDialog}
        >
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-popover/95 backdrop-blur-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={handleExport} disabled={exporting}>
              <SelectTrigger className="w-full md:w-[120px]">
                <Download className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="glass-card shadow-card">
        <CardHeader>
          <CardTitle>All Transactions ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No transactions found</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={handleOpenDialog}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first transaction
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-all duration-200 hover:shadow-glow group"
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
                        style={{
                          borderColor: transaction.category.color,
                          color: transaction.category.color,
                        }}
                      >
                        {transaction.category.name}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`font-semibold text-lg ${
                            transaction.type === "income" ? "text-success" : "text-foreground"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        <Badge
                          variant="outline"
                          className="md:hidden mt-1 bg-background/50"
                          style={{
                            borderColor: transaction.category.color,
                            color: transaction.category.color,
                          }}
                        >
                          {transaction.category.name}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit" : "Add"} Transaction
            </DialogTitle>
            <DialogDescription>
              {editingTransaction ? "Update" : "Create a new"} transaction record
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => {
                  // Reset category when type changes and auto-select first of new type
                  const newCategories = categories.filter(cat => cat.type === value);
                  setFormData({ 
                    ...formData, 
                    type: value, 
                    category_id: newCategories[0]?.id || ''
                  });
                }}
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
                disabled={categoriesLoading || filteredCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    categoriesLoading 
                      ? "Loading categories..." 
                      : filteredCategories.length === 0 
                        ? "No categories available" 
                        : "Select category"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {formData.type === 'expense' 
                        ? 'No expense categories found.' 
                        : 'No income categories found.'}
                    </div>
                  ) : (
                    filteredCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          {cat.color && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.color }}
                            />
                          )}
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {!categoriesLoading && filteredCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Go to <a href="/categories" className="text-primary underline">Categories</a> to create one
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Grocery shopping"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={!formData.category_id || categoriesLoading}
              >
                {editingTransaction ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}