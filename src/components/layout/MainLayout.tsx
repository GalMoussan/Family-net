import { Outlet } from "react-router-dom";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";

export function MainLayout() {
	return (
		<div className="flex min-h-screen bg-surface-dim">
			{/* Desktop Sidebar (Hidden on Mobile) */}
			<DesktopSidebar />

			{/* Main Content Area */}
			<main className="flex-1 pb-20 md:ml-64 md:pb-0">
				<div className="mx-auto max-w-2xl min-h-screen md:pt-8">
					<Outlet />
				</div>
			</main>

			{/* Mobile Bottom Nav (Hidden on Desktop) */}
			<div className="md:hidden">
				<MobileNav />
			</div>
		</div>
	);
}