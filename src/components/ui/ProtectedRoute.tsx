import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  requiredRole: UserRole;
  redirectTo?: string;
}

type Status = 'loading' | 'allowed' | 'denied';

export default function ProtectedRoute({ children, requiredRole, redirectTo = '/host/login' }: Props) {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setStatus('denied');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const role = (profile?.role as UserRole) ?? 'guest';

      const allowed =
        requiredRole === 'admin'
          ? role === 'admin'
          : requiredRole === 'host'
          ? role === 'host' || role === 'admin'
          : true;

      setStatus(allowed ? 'allowed' : 'denied');
    });
  }, [requiredRole]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'denied') return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
