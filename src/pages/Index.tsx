import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Loader2, Wallet } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuth, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuth) {
        // User is authenticated, redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // User is not authenticated, redirect to login
        navigate("/login", { replace: true });
      }
    }
  }, [isAuth, loading, navigate]);

  // Show loading state while checking authentication
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold tracking-tight">
          Personal Finance Assistant
        </h1>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p className="text-lg">Loading your financial dashboard...</p>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium">
            💰 Track Expenses
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium">
            📊 Analytics
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium">
            🎯 Budgets
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-xs font-medium">
            🔄 Recurring
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;