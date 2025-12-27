"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { LoginApi } from "@/api/auth"
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


  // ✅ Simple validations
  const validate = () => {
    if (!loginId) return "Login ID is required";
    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    return "";
  };

  // ✅ Submit handler (API ready)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await LoginApi({ loginId, password });

      toast.success("Login successful", {
        description: "Redirecting to dashboard...",
      });


      // Small delay for UX
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);

    } catch (err: any) {
      toast.error("Invalid login ID or password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            School ERP Login
          </CardTitle>
          <CardDescription>
            Sign in to manage fees, students & accounts
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login ID */}
            <div className="space-y-2">
              <Label htmlFor="loginId">Login ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter your login ID"
                  className="pl-10"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full rounded-xl text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            
            {/* Forgot password */}
            <div className="text-center">
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} School ERP System
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
