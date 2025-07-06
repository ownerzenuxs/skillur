import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  scs_number: string | null;
  phone_number: string | null;
  role: string;
  coins: number;
  is_admin: boolean;
  is_premium: boolean;
  premium_expires_at: string | null;
  referral_count: number;
  referred_by: string | null;
  class: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signIn: (scsNumber: string, password: string) => Promise<{ error: any }>;
  signUp: (
    scsNumber: string,
    password: string,
    phoneNumber: string,
    referrerScs?: string,
    classValue?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (scsNumber: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${scsNumber}@skillur.app`,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (
    scsNumber: string,
    password: string,
    phoneNumber: string,
    referrerScs?: string,
    classValue?: string
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: `${scsNumber}@skillur.app`,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            scs_number: scsNumber,
            phone_number: phoneNumber,
            role: 'student',
            is_admin: false,
            class: classValue || '6',
          },
        },
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (referrerScs) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          await supabase.rpc('handle_referral', {
            referrer_scs: referrerScs,
            new_user_id: userData.user.id,
          });
        }
      }

      toast({
        title: "Account Created",
        description: "Welcome to Skillur! Please sign in to continue.",
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      signIn,
      signUp,
      signOut,
      loading,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}