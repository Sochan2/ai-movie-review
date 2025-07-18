"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/utils/supabase/client';
import { AlertTriangle } from "lucide-react";

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

// タブ同期用の関数を定義
function notifyAuthUpdated(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('auth-updated', Date.now().toString());
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('auth_channel');
        channel.postMessage('auth-updated');
        channel.close();
      }
    } catch (e) {
      // ignore
    }
  }
}

export default function VerifiedPage() {
  const router = useRouter();
  const { user, isLoading, setUser } = useUser();
  const [inApp, setInApp] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setInApp(isInAppBrowser());
    // 認証完了画面に来たら必ずサインアウト
    const supabase = createClient();
    supabase.auth.signOut();
    // localStorage/sessionStorageもクリア
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('sb-')) sessionStorage.removeItem(key);
      });
      // サーバー側クッキーも消す
      fetch('/api/logout', { credentials: 'include' });
    }
  }, []);

  // 認証済みになった瞬間にタブ同期通知
  // useEffect(() => {
  //   if (user && user.email_confirmed_at) {
  //     notifyAuthUpdated();
  //     setRedirecting(true);
  //     const timer = setTimeout(() => {
  //       router.replace("/login");
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [user, router]);

  // Resend verification email handler
  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(null);
    setResendError(null);
    try {
      if (!user?.email) throw new Error("No email found.");
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      } as any); // Supabase型の都合でas any
      if (error) throw error;
      setResendSuccess("Verification email sent!");
      toast({ title: "Verification email sent!", description: "Please check your inbox." });
    } catch (e: any) {
      setResendError(e.message || "Failed to resend verification email.");
      toast({ title: "Failed to resend", description: e.message || "Please try again later.", variant: "destructive" });
    } finally {
      setResendLoading(false);
    }
  };

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
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow-lg mb-6 flex flex-col items-center">
            <AlertTriangle className="text-yellow-600 w-10 h-10 mb-2" />
            <div className="font-bold text-lg text-yellow-800 mb-2 text-center">
              Warning: In-app browsers may not work properly!
            </div>
            <div className="text-yellow-700 text-center mb-4">
              This page may not work properly in in-app browsers (such as Gmail, LINE, Instagram, etc).<br/>
              <b>Please open this page in <u>Safari</u> or <u>Chrome</u> for a smooth login experience.</b>
            </div>
            <Button className="w-full font-bold text-lg bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => window.open(window.location.href, '_blank')}>
              Open in Safari/Chrome
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Email Confirmation Required</CardTitle>
              <CardDescription>
                You must open this page in Safari or Chrome to complete your login. In-app browsers may block cookies and prevent login.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Email verified UI
  if (user && user.email_confirmed_at) {
    const handleGoToLogin = () => {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        fetch('/api/logout', { credentials: 'include' });
        const supabase = createClient();
        supabase.auth.signOut();
        setUser(null); // 追加
      }
      router.replace("/login");
    };
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Email Verified!</CardTitle>
              <CardDescription>
                <div className="text-red-600 font-bold mb-2">Verification complete!</div>
                <div className="mb-2">For security reasons, you must <b>log in again</b> with your email and password.</div>
                <div className="mb-2">Please go to the login page and sign in to continue.</div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleGoToLogin}>Go to Login</Button>
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
            <CardDescription>
              Your email is not verified yet. Please check your email for the verification link.<br/>
              <span style={{ color: '#888' }}>
                If you are having trouble, please try clearing your browser cache and cookies.<br/>
                Still not working? You can resend the verification email below.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full mb-2" onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? "Resending..." : "Resend Verification Email"}
            </Button>
            {resendSuccess && <div className="text-green-600 text-sm text-center mt-2">{resendSuccess}</div>}
            {resendError && <div className="text-red-600 text-sm text-center mt-2">{resendError}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 