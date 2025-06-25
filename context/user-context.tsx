"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Preferences {
  selected_subscriptions?: string[];
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
  signUpWithEmail: async () => {},
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

  const updateUserProfile = async (userId: string, data: Record<string, any>) => {
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
      (_event, session) => {
        setUser(session?.user ?? null);
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
      await updateUserProfile(data.user.id, {
        display_name: data.user.email?.split('@')[0] || 'Unknown',
        is_anonymous: false,
      });
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;

    if (data.user) {
      await updateUserProfile(data.user.id, {
        display_name: email.split('@')[0] || 'Unknown',
        is_anonymous: false,
      });
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
