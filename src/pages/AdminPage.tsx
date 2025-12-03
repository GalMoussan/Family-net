import { useEffect, useState } from "react";
import { Trash2, ShieldAlert } from "lucide-react";
import { useAuth } from "../features/auth/AuthContext";
import { ArticlePost } from "../types";
import { getAllVideosAdmin, deleteVideoAdmin } from "../features/admin/adminService";

export function AdminPage() {
	const { user, isAdmin } = useAuth();
	const [videos, setVideos] = useState<ArticlePost[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		const data = await getAllVideosAdmin();
		setVideos(data);
		setLoading(false);
	};

	useEffect(() => {
		if (isAdmin) fetchData();
	}, [isAdmin]);

	// Handle Actions
	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to permanently delete this video?")) return;
		await deleteVideoAdmin(id);
		// Optimistic UI update (remove from list immediately)
		setVideos(prev => prev.filter(v => v.id !== id));
	};

	// Security Gate
	if (!user || !isAdmin) {
		return (
			<div className="flex h-screen flex-col items-center justify-center p-4 text-center">
				<ShieldAlert size={64} className="mb-4 text-red-500" />
				<h1 className="text-2xl font-bold">Access Denied</h1>
				<p className="text-gray-500">You do not have permission to view this area.</p>
			</div>
		);
	}

	return (
		<div className="p-6 md:pl-80 pt-8 pb-24">
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
				<button
					onClick={fetchData}
					className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
				>
					Refresh Data
				</button>
			</div>

			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm text-gray-500">
						<thead className="bg-gray-50 text-xs uppercase text-gray-700">
							<tr>
								<th className="px-6 py-4">Video</th>
								<th className="px-6 py-4">Title</th>
								<th className="px-6 py-4">Author</th>
								<th className="px-6 py-4">Date</th>
								<th className="px-6 py-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{videos.map((video) => (
								<tr key={video.id} className="hover:bg-gray-50">
									<td className="px-6 py-4">
										<a href={video.videoURL} target="_blank" rel="noreferrer" className="block h-20 w-12 overflow-hidden rounded bg-black">
											<video src={video.videoURL} className="h-full w-full object-cover" />
										</a>
									</td>
									<td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
										{video.title}
									</td>
									<td className="px-6 py-4">
										<div className="flex items-center gap-2">
											{video.author?.photoURL && (
												<img src={video.author.photoURL} className="h-6 w-6 rounded-full" />
											)}
											<span>{video.author?.displayName || "Unknown"}</span>
										</div>
									</td>
									<td className="px-6 py-4">
										{/* Handle Timestamp conversion if needed */}
										{new Date(video.createdAt?.seconds * 1000).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 text-right">
										<div className="flex justify-end gap-2">
											<button
												onClick={() => handleDelete(video.id)}
												className="rounded-lg p-2 text-red-600 hover:bg-red-50"
												title="Delete Permanently"
											>
												<Trash2 size={18} />
											</button>
										</div>
									</td>
								</tr>
							))}

							{videos.length === 0 && !loading && (
								<tr>
									<td colSpan={5} className="py-8 text-center">No videos found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}