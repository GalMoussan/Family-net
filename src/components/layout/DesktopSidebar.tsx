import { NavLink } from "react-router-dom";
import { Home, Film, MessageCircle, User, PlusSquare, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

export function DesktopSidebar() {
	// Simple logo placeholder
	return (
		<aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-100 bg-white px-6 py-8 md:flex md:flex-col">
			<div className="mb-10 flex items-center gap-2 px-2">
				<div className="h-8 w-8 rounded-lg bg-primary-500" />
				<h1 className="text-xl font-bold tracking-tight">FamilyNet</h1>
			</div>

			<nav className="flex flex-1 flex-col gap-2">
				{[
					{ icon: Home, label: "Home", path: "/" },
					{ icon: Film, label: "Reels", path: "/reels" },
					{ icon: MessageCircle, label: "Messages", path: "/messages" },
					{ icon: User, label: "Profile", path: "/profile/me" },
					{ icon: PlusSquare, label: "Create", path: "/upload" },
				].map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:bg-primary-50",
								isActive && "bg-primary-50 text-primary-600"
							)
						}
					>
						<item.icon size={22} />
						{item.label}
					</NavLink>
				))}
			</nav>

			<button className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600">
				<LogOut size={22} />
				Log out
			</button>
		</aside>
	);
}