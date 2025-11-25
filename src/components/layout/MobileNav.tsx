import { NavLink } from "react-router-dom";
import { Home, Film, MessageCircle, User, PlusSquare } from "lucide-react";
import { cn } from "../../lib/utils";

export function MobileNav() {
	const navItems = [
		{ icon: Home, label: "Home", path: "/" },
		{ icon: Film, label: "Reels", path: "/reels" },
		{ icon: null, label: "Upload", path: "/upload" }, // Middle generic placeholder
		{ icon: MessageCircle, label: "Chat", path: "/messages" },
		{ icon: User, label: "Profile", path: "/profile/me" },
	];

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-gray-100 pb-safe-area">
			<div className="grid h-full grid-cols-5 items-center justify-items-center">
				{navItems.map((item) => {
					if (!item.icon) {
						// Floating Upload Button
						return (
							<NavLink key="upload" to="/upload" className="relative -top-5">
								<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-transform active:scale-95">
									<PlusSquare size={28} />
								</div>
							</NavLink>
						);
					}

					const Icon = item.icon;
					return (
						<NavLink
							key={item.path}
							to={item.path}
							className={({ isActive }) =>
								cn(
									"flex flex-col items-center justify-center text-gray-400 transition-colors",
									isActive && "text-primary-500"
								)
							}
						>
							<Icon size={24} strokeWidth={2.5} />
						</NavLink>
					);
				})}
			</div>
		</nav>
	);
}