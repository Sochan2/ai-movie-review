"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/context/user-context";

function isInAppBrowser() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  // Add more as needed
  return (
    ua.includes('line') ||
    ua.includes('instagram') ||
    ua.includes('fbav') || // Facebook app
    ua.includes('twitter') ||
    ua.includes('gmail') ||
    ua.includes('wv') // WebView
  );
}

export default function VerifiedPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (inApp) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Open in Safari or Chrome</CardTitle>
              <CardDescription>
                This page may not work properly in in-app browsers (such as Gmail, LINE, Instagram, etc).<br/>
                Please open this page in Safari or Chrome for a smooth experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.open(window.location.href, '_blank')}>Open in Safari/Chrome</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Email verified UI
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

  // Not verified
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