"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/context/user-context";

export default function VerifiedPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // ユーザーが認証済みで、メール確認も完了している場合はホームページにリダイレクト
    if (!isLoading && user && user.email_confirmed_at) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Email verified!</CardTitle>
            <CardDescription>Your email address has been successfully verified.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/")}>Go to the app</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 