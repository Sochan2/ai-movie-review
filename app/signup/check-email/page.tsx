"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

export default function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setResent(false);
    try {
      // You should implement the resend logic here, e.g. call your API
      // await resendVerificationEmail(email);
      setResent(true);
    } catch (e: any) {
      setError("Failed to resend email. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a confirmation link to <b>{email}</b>.<br />
              Please check your inbox and click the link to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resent && (
              <Alert variant="default" className="mb-4">
                <AlertDescription>Email resent! Please check your inbox.</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <Button onClick={handleResend} disabled={resent} className="w-full">
                {resent ? "Email resent!" : "Resend email"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                (Check your spam folder if you don&apos;t see it.)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 