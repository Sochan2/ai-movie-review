"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/context/user-context";

export default function VerifiedPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // メール認証済み
  if (user && user.email_confirmed_at) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>Your email address has been successfully verified.<br/>Please re-login to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.replace("/login?forceSignOut=1")}>Go to Login</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 未認証の場合
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>Your email is not verified yet. Please check your email for the verification link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
} 