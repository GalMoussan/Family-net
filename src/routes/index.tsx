// FILE: src/routes/index.tsx
import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { AuthPage } from "../pages/AuthPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { FeedList } from "../features/feed/FeedList";
import { MessagesPage } from "../pages/MessagesPage";
import { UploadWizard } from "../features/upload/UploadWizard";
// Placeholder Components for testing
const Placeholder = ({ title }: { title: string }) => (
	<div className="flex h-[80vh] items-center justify-center p-4">
		<div className="text-center">
			<h2 className="text-2xl font-bold text-gray-800">{title}</h2>
			<p className="text-gray-500">Coming soon...</p>
		</div>
	</div>
);

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<ProtectedRoute>
				<MainLayout />
			</ProtectedRoute>
		),
		children: [
			{ index: true, element: <FeedList /> },
			{ path: "reels", element: <FeedList /> },
			{ path: "messages", element: <MessagesPage /> },
			{ path: "upload", element: <UploadWizard /> },
			{ path: "profile/:uid", element: <Placeholder title="User Profile" /> },
			{ path: "admin", element: <Placeholder title="Admin Dashboard" /> },
		],
	},
	{
		path: "/auth",
		element: <AuthPage />,
	},
]);