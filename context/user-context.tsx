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
  isAuthenticated: boolean; // 追加
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePreferences: (preferences: Preferences) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false, // 初期値
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async (email: string, password: string) => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePreferences: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const isAuthenticated = !!user;

  const updateUserProfile = async (userId: string, data: UserProfileUpdate) => {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  };

  useEffect(() => {
    let initialized = false;
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        
        // 初回サインイン時にプロフィールを作成
        if (session?.user && _event === 'SIGNED_IN') {
          try {
            await updateUserProfile(session.user.id, {
              display_name: session.user.email?.split('@')[0] || 'Unknown',
              is_anonymous: false,
            });
            console.log('User profile created/updated on auth state change');
          } catch (profileError) {
            console.error('Failed to create/update user profile on auth state change:', profileError);
          }
        }
        
        if (!initialized) {
          setIsLoading(false);
          initialized = true;
        }
      }
    );
    // getSessionでonAuthStateChangeを必ず発火させる
    supabase.auth.getSession();
    return () => {
      data.subscription.unsubscribe();
    };
  }, [router, toast]);

  const signInWithGoogle = async () => {
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
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
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
        console.log('User profile created/updated successfully');
      } catch (profileError) {
        console.error('Failed to create/update user profile:', profileError);
        // プロフィール作成に失敗してもサインインは続行
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (error) {
          console.error(`Signup attempt ${attempt} error:`, error);
          
          // 429エラーの場合、リトライを試みる
          if (error.message.includes('rate limit') || error.message.includes('429')) {
            lastError = new Error(`Too many signup attempts (attempt ${attempt}/${maxRetries}). Please wait a few minutes before trying again.`);
            
            if (attempt < maxRetries) {
              // 指数バックオフで待機（1秒、2秒、4秒）
              const waitTime = Math.pow(2, attempt - 1) * 1000;
              console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          
          throw error;
        }

        // サインアップ成功 - プロフィール作成は初回サインイン時に行う
        console.log('Signup successful, user created:', data.user?.id);
        
        // 成功したらループを抜ける
        return;
        
      } catch (error: any) {
        console.error(`Signup attempt ${attempt} failed:`, error);
        lastError = error;
        
        // 429エラー以外の場合は即座にエラーを投げる
        if (!error.message?.includes('rate limit') && !error.message?.includes('429')) {
          throw error;
        }
        
        // 最後の試行で429エラーの場合
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const updatePreferences = async (preferences: Preferences) => {
    if (!user) return;
    await updateUserProfile(user.id, preferences);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPassword,
        updatePreferences,
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
