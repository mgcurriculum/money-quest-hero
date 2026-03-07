import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return;
      }
      setUser(session.user);
      const { data } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin',
      });
      setIsAdmin(!!data);
      setIsLoading(false);
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
  };

  return { isAdmin, isLoading, user, signOut };
}
