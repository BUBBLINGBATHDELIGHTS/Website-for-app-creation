import { Navigate, useLocation } from 'react-router-dom';
import { useWorkspaceAccess } from '../context/WorkspaceAccessContext.jsx';

export default function RequireWorkspaceAccess({ children }) {
  const { hasAccess } = useWorkspaceAccess();
  const location = useLocation();

  if (!hasAccess) {
    return <Navigate to="/work-with-bubbles" replace state={{ from: location }} />;
  }

  return children;
}
