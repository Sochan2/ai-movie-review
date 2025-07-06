"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifiedPage() {
  const router = useRouter();
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