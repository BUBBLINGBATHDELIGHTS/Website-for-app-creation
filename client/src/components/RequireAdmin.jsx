import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAdmin({ children }) {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="rounded-3xl bg-white px-6 py-8 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-500">Checking permissions…</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
