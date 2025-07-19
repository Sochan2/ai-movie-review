"use client";

import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Preferences {
  selected_subscriptions?: string[];
}

interface UserProfileUpdate {
  display_name?: string;
  is_anonymous?: boolean;
  selected_subscriptions?: string[];
  last_login?: string;
  // updated_atは自動で追加
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void; // 追加
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePreferences: (preferences: Preferences) => Promise<void>;
  signInWithOtp: (email: string) => Promise<void>;
  signUpWithTestEmail: (password: string) => Promise<void>; // テスト用
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false, // 初期値
  setUser: () => {}, // 初期値
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async (email: string, password: string) => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePreferences: async () => {},
  signInWithOtp: async () => {},
  signUpWithTestEmail: async () => {}, // テスト用
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // グローバルなsupabase変数は削除済み
  // 各useEffectや関数内でconst supabase = createClient();を必ず定義
  // linterエラー箇所もすべてsupabaseを都度定義

  // 例: updateUserProfile
  const updateUserProfile = async (userId: string, data: UserProfileUpdate) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
  };

  // --- タブ復帰・フォーカス時のセッション再取得とタイムアウト処理 ---
  useEffect(() => {
    const supabase = createClient();
    let lastActive = Date.now();
    const handleFocus = () => {
      const now = Date.now();
      // 1分（60,000ms）以上経過していたらサインアウト
      if (now - lastActive > 60000) {
        supabase.auth.signOut().then(() => {
          router.push('/login?message=Session expired. Please log in again.');
        });
      } else {
        supabase.auth.getSession().then((result) => {
          setUser(result.data.session?.user || null);
          setIsLoading(false);
        });
      }
      lastActive = now;
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    let unsubscribed = false;
    // まずgetSessionで即座に状態を反映
    supabase.auth.getSession().then((result) => {
      if (!unsubscribed) {
        setUser(result.data.session?.user || null);
        setIsLoading(false);
      }
    });
    // onAuthStateChangeで状態変化を監視
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // if (process.env.NODE_ENV !== 'production') {
        //   console.log('onAuthStateChange event:', _event, 'session:', session);
        // }
        setUser(session?.user ?? null);
        if (!unsubscribed) {
          setIsLoading(false);
        }
        // 初回サインイン時にプロフィールを作成
        if (session?.user && _event === 'SIGNED_IN') {
          try {
            await updateUserProfile(session.user.id, {
              display_name: session.user.email?.split('@')[0] || 'Unknown',
              is_anonymous: false,
            });
            // if (process.env.NODE_ENV !== 'production') {
            //   console.log('User profile created/updated on auth state change');
            // }
          } catch (profileError) {
            // if (process.env.NODE_ENV !== 'production') {
            //   console.error('Failed to create/update user profile on auth state change:', profileError);
            // }
          }
        }
      }
    );
    return () => {
      unsubscribed = true;
      data.subscription.unsubscribe();
    };
  }, [router, toast]);

  useEffect(() => {
    if (!isLoading && user === null) {
      if (
        typeof window !== 'undefined' &&
        !['/', '/login', '/signup', '/signup/check-email', '/auth/verified', '/auth/callback'].includes(window.location.pathname) &&
        !window.location.pathname.startsWith('/auth/')
      ) {
        window.location.href = '/login?message=Session expired. Please log in again.';
      }
    }
  }, [user, isLoading]);

  // --- user_profiles自動作成 ---
  useEffect(() => {
    if (user && !isLoading) {
      const supabase = createClient();
      supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!data) {
            supabase.from('user_profiles').insert({
              user_id: user.id,
              selected_subscriptions: [],
              favorite_genres: [],
            });
          }
        });
    }
  }, [user, isLoading]);

  const notifyAuthUpdated = (): void => {
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
  };

  const signInWithGoogle = async (): Promise<void> => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      notifyAuthUpdated();
    } catch (error) {
      // console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data.user) {
      setUser(data.user);
      
      // 初回サインイン時にプロフィールを作成
      try {
        await updateUserProfile(data.user.id, {
          display_name: data.user.email?.split('@')[0] || 'Unknown',
          is_anonymous: false,
        });
        // console.log('User profile created/updated successfully');
      } catch (profileError) {
        // console.error('Failed to create/update user profile:', profileError);
        // プロフィール作成に失敗してもサインインは続行
      }
      notifyAuthUpdated();
    }
  };

  const signInWithOtp = async (email: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    notifyAuthUpdated();
  };

  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    const supabase = createClient();
    const maxRetries = 5; // リトライ回数を増やす
    let lastError: any = null;

    // 開発環境ではレート制限を回避するための対策
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseEmail = email.split('@')[0];
    const domain = email.split('@')[1] || 'gmail.com';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 開発環境では毎回異なるメールアドレスを使用
        let testEmail = email;
        if (isDevelopment && attempt > 1) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          testEmail = `${baseEmail}+${timestamp}${random}@${domain}`;
          // console.log(`Using test email for attempt ${attempt}:`, testEmail);
        }

        const { data, error } = await supabase.auth.signUp({
          email: testEmail,
          password,
          options: {
            //            emailRedirectTo: `${window.location.origin}/auth/verified`,
            emailRedirectTo: `${window.location.origin}/login?forceSignOut=1`,
          },
        });
        
        if (error) {
          // console.error(`Signup attempt ${attempt} error:`, error);
          
          // レート制限エラーの場合、より長い待機時間を設定
          if (error.message.includes('rate limit') || error.message.includes('429')) {
            lastError = new Error(`Too many signup attempts (attempt ${attempt}/${maxRetries}). Please wait a few minutes before trying again.`);
            
            if (attempt < maxRetries) {
              // 開発環境ではより長い待機時間（5秒、10秒、15秒、20秒）
              const waitTime = isDevelopment 
                ? attempt * 5000 
                : Math.pow(2, attempt - 1) * 1000;
              // console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          
          throw error;
        }

        // サインアップ成功 - プロフィール作成は初回サインイン時に行う
        // console.log('Signup successful, user created:', data.user?.id);
        
        // 成功したらループを抜ける
        notifyAuthUpdated();
        return;
        
      } catch (error: any) {
        // console.error(`Signup attempt ${attempt} failed:`, error);
        lastError = error;
        
        // レート制限エラー以外の場合は即座にエラーを投げる
        if (!error.message?.includes('rate limit') && !error.message?.includes('429')) {
          throw error;
        }
        
        // 最後の試行でレート制限エラーの場合
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }
  };

  const resetPassword = async (email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) throw error;
  };

  // --- BroadcastChannel for logout sync ---
  const logoutChannel = React.useRef<BroadcastChannel | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      logoutChannel.current = new window.BroadcastChannel('logout_channel');
      const handler = (event: MessageEvent) => {
        if (event.data === 'logout') {
          window.location.href = '/login?message=You have been signed out.';
        }
      };
      logoutChannel.current.addEventListener('message', handler as EventListener);
      return () => {
        logoutChannel.current?.removeEventListener('message', handler as EventListener);
        logoutChannel.current?.close();
      };
    }
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    // サーバー側クッキーを先に消す
    await fetch('/api/logout', { credentials: 'include' });
    // Supabaseクライアントのセッション削除
    await supabase.auth.signOut();
    // 念のためセッションが消えているか確認し、残っていれば再度サインアウト
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await supabase.auth.signOut();
    }
    // localStorage/sessionStorageの全クリア（sb-で始まるものも個別に削除）
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('sb-')) sessionStorage.removeItem(key);
      });
      localStorage.clear();
      sessionStorage.clear();
      if (window._supabase) {
        delete window._supabase;
      }
    }
    // UserProviderのuser stateもnullに
    setUser(null);
    // Broadcast logout to all tabs
    logoutChannel.current?.postMessage('logout');
    // 完全リロード
    window.location.href = '/login?message=You have been signed out.';
  };

  const updatePreferences = async (preferences: Preferences) => {
    if (!user) return;
    const supabase = createClient();
    await updateUserProfile(user.id, preferences);
  };

  const signUpWithTestEmail = async (password: string): Promise<void> => {
    const supabase = createClient();
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseEmail = 'testuser'; // テスト用のメールアドレスのベース
    const domain = 'example.com'; // テスト用のドメイン

    let testEmail = `${baseEmail}@${domain}`;
    if (isDevelopment) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      testEmail = `${baseEmail}+${timestamp}${random}@${domain}`;
      // console.log('Using test email for signup:', testEmail);
    }

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?forceSignOut=1`,
      },
    });

    if (error) {
      // console.error('Signup with test email error:', error);
      throw error;
    }

    // console.log('Signup with test email successful:', data.user?.id);
    notifyAuthUpdated();
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const supabase = createClient();
    const handleAuthUpdate = (): void => {
      supabase.auth.getSession().then((result) => {
        setUser(result.data.session?.user || null);
        setIsLoading(false);
      });
    };
    const storageListener = (e: StorageEvent): void => {
      if (e.key === 'auth-updated') handleAuthUpdate();
    };
    window.addEventListener('storage', storageListener);
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('auth_channel');
      channel.onmessage = (e: MessageEvent): void => {
        if (e.data === 'auth-updated') handleAuthUpdate();
      };
    }
    return () => {
      window.removeEventListener('storage', storageListener);
      if (channel) channel.close();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        setUser, // 追加
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        updatePreferences,
        signInWithOtp,
        signUpWithTestEmail,
      }}
    >
      {!isLoading ? (
        children
      ) : (
        <div className="text-center mt-10">Loading...</div>
      )}
    </UserContext.Provider>
  );
}
