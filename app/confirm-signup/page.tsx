"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ConfirmSignupPage() {
  const searchParams = useSearchParams();
  const confirmationUrl = searchParams.get("confirmation_url");
  const router = useRouter();

  if (!confirmationUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Link</CardTitle>
            <CardDescription>
              The confirmation link is missing or invalid.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Almost done!</CardTitle>
          <CardDescription>
            Click the button below to confirm your sign-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => {
              window.location.href = confirmationUrl;
            }}
          >
            Confirm Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 