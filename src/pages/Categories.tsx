import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Edit, Plus, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categoryApi } from "@/services/transactService";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon?: string;
  is_default: boolean;
  transaction_count?: number;
}

export default function Categories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#8b5cf6",
    icon: "",
  });

  // Fetch categories with counts
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getWithCounts();
      setCategories(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        if (editingCategory.is_default) {
          toast({
            title: "Cannot edit default category",
            description: "Default categories cannot be modified",
            variant: "destructive",
          });
          return;
        }
        await categoryApi.update(editingCategory.id, formData);
        toast({ title: "Category updated successfully" });
      } else {
        await categoryApi.create(formData);
        toast({ title: "Category created successfully" });
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", type: "expense", color: "#8b5cf6", icon: "" });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error saving category",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: Category) => {
    if (category.is_default) {
      toast({
        title: "Cannot edit default category",
        description: "Default categories cannot be modified",
        variant: "destructive",
      });
      return;
    }

    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      toast({
        title: "Cannot delete default category",
        description: "Default categories cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await categoryApi.delete(id);
      toast({ title: "Category deleted successfully" });
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error deleting category",
        description: error.response?.data?.error?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === "income");
  const expenseCategories = categories.filter(cat => cat.type === "expense");

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
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your transactions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-glow" onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", type: "expense", color: "#8b5cf6", icon: "" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit" : "Create"} Category</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update" : "Add a new"} category for your transactions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Groceries"
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
                  disabled={!!editingCategory}
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
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., shopping-cart"
                />
                <p className="text-xs text-muted-foreground">
                  Lucide icon name (optional)
                </p>
              </div>
              <Button type="submit" className="w-full">
                {editingCategory ? "Update" : "Create"} Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Income Categories
            </CardTitle>
            <CardDescription>{incomeCategories.length} categories</CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No income categories yet
              </p>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {category.name}
                          {category.is_default && (
                            <span className="text-xs text-muted-foreground">(Default)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {category.transaction_count || 0} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        disabled={category.is_default}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id, category.is_default)}
                        disabled={category.is_default}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Expense Categories
            </CardTitle>
            <CardDescription>{expenseCategories.length} categories</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No expense categories yet
              </p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {category.name}
                          {category.is_default && (
                            <span className="text-xs text-muted-foreground">(Default)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {category.transaction_count || 0} transactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        disabled={category.is_default}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id, category.is_default)}
                        disabled={category.is_default}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}