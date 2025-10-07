import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initiateGoogleLogin, initiateGithubLogin } from "../services/authService";
import { Wallet, Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const handleGoogleLogin = () => {
    initiateGoogleLogin();
  };

  const handleGithubLogin = () => {
    initiateGithubLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Personal Finance
          </h1>
          <p className="text-muted-foreground">
            Track, manage, and grow your wealth
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass-card shadow-card border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to access your financial dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login Button */}
            <Button
              variant="outline"
              className="w-full h-12 text-base hover:bg-accent hover:shadow-glow transition-all group"
              onClick={handleGoogleLogin}
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* GitHub Login Button */}
            <Button
              variant="outline"
              className="w-full h-12 text-base hover:bg-accent hover:shadow-glow transition-all group"
              onClick={handleGithubLogin}
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>

            {/* Terms and Privacy */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              By continuing, you agree to our{" "}
              <a href="#" className="underline hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="space-y-1">
            <div className="text-2xl">🔒</div>
            <div className="font-medium">Secure</div>
            <div className="text-xs text-muted-foreground">Bank-level encryption</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">📊</div>
            <div className="font-medium">Smart</div>
            <div className="text-xs text-muted-foreground">AI-powered insights</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🎯</div>
            <div className="font-medium">Goals</div>
            <div className="text-xs text-muted-foreground">Track & achieve</div>
          </div>
        </div>
      </div>
    </div>
  );
}