import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface Props {
  children: React.ReactNode;
  requiredRole: UserRole;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, requiredRole, redirectTo = '/host/login' }: Props) {
  const { user, profile, role, loading } = useAuth();

  const spinner = (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (loading) return spinner;

  // User is authenticated but profile hasn't resolved yet — wait
  if (user && profile === null && role === 'guest') return spinner;

  if (!user) return <Navigate to={redirectTo} replace />;

  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'host' && role !== 'host' && role !== 'admin') {
    return <Navigate to="/host/login" replace />;
  }

  return <>{children}</>;
}
