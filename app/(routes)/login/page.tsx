"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Film } from "lucide-react";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const externalMessage = searchParams.get("message");
  const { signInWithEmail, signUpWithEmail, resetPassword, signInWithGoogle } =
    useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // クリア関数
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      toast({
        title: "Signed in",
        description: "Welcome back!",
      });
      router.push("/");
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      await signUpWithEmail(email, password);
      toast({
        title: "Check your email",
        description:
          "We've sent you a confirmation link to complete the sign up process.",
      });
      setSuccess("Account created! Please confirm via email.");
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Error creating account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(
        "If an account exists with this email, you will receive password reset instructions."
      );
      toast({
        title: "Reset instructions sent",
        description: "Please check your email for password reset instructions.",
      });
      setTimeout(() => setIsForgotPassword(false), 3000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Unable to send reset instructions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setIsLoading(true);

    try {
      await signInWithGoogle();
      router.push("/");
    } catch (err) {
      console.error("Google sign in error:", err);
      setError("Error signing in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Film className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to MyMasterpiece</h1>
          <p className="text-muted-foreground">
            Sign in to discover your next favorite movie
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isForgotPassword ? "Reset Password" : "Sign In"}</CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Enter your email to receive reset instructions"
                : "Enter your email below to create your account or sign in"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {(externalMessage || error || success) && (
              <Alert
                variant={
                  success || externalMessage ? "default" : "destructive"
                }
                className="mb-6"
              >
                <AlertDescription>
                  {externalMessage || error || success}
                </AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={
                isForgotPassword ? handleResetPassword : handleSignIn
              }
            >
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

                {!isForgotPassword && (
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
                )}

                <CardFooter className="flex flex-col space-y-4 pt-6">
                  {isForgotPassword ? (
                    <>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Sending..." : "Send Reset Instructions"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setIsForgotPassword(false)}
                        disabled={isLoading}
                        type="button"
                      >
                        Back to Sign In
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSignUp}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Sign Up"}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading}
                      >
                        Sign in with Google
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => setIsForgotPassword(true)}
                        disabled={isLoading}
                      >
                        Forgot Password?
                      </Button>
                    </>
                  )}
                </CardFooter>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
