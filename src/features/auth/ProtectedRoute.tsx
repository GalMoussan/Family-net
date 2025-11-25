import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex h-screen w-full items-center justify-center bg-surface-dim">
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
			</div>
		);
	}

	if (!user) {
		// Redirect to login, but save the location they were trying to access
		return <Navigate to="/auth" state={{ from: location }} replace />;
	}

	return <>{children}</>;
}