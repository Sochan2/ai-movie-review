"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/context/user-context";

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // バリデーション
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      router.push(`/signup/check-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // エラーメッセージをより具体的に表示
      if (err.message) {
        if (err.message.includes('rate limit') || err.message.includes('429')) {
          setError("Too many signup attempts. Please try using a different email address or wait a few minutes before trying again.");
        } else {
          setError(err.message);
        }
      } else if (err.error?.message) {
        setError(err.error.message);
      } else {
        setError("Error creating account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
                {error.includes('rate limit') && (
                  <div className="mt-2 text-sm">
                    <p className="font-semibold">Tips to avoid rate limiting:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Use a different email address</li>
                      <li>Wait 5-10 minutes before trying again</li>
                      <li>Check your spam folder for confirmation emails</li>
                    </ul>
                  </div>
                )}
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="mb-6">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/login")}
                  disabled={isLoading}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 