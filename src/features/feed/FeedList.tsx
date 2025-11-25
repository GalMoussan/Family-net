import { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { db } from "../../lib/firebase";
import { VideoPost } from "../../types";
import { ReelCard } from "./ReelCard";

export function FeedList() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [videos, setVideos] = useState<VideoPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeIndex, setActiveIndex] = useState(0);

	// 1. Fetch Videos from Firestore
	useEffect(() => {
		// Query: Get videos, newest first
		const q = query(
			collection(db, "videos"),
			orderBy("createdAt", "desc")
		);

		// Real-time listener
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const fetchedVideos = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as VideoPost[];

			setVideos(fetchedVideos);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// 2. Handle Scroll Snapping (Same as before)
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const options = {
			root: container,
			threshold: 0.6,
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const index = Number(entry.target.getAttribute("data-index"));
					setActiveIndex(index);
				}
			});
		}, options);

		// We need to re-attach observers whenever the video list changes
		const children = container.querySelectorAll(".reel-wrapper");
		children.forEach((child) => observer.observe(child));

		return () => observer.disconnect();
	}, [videos]); // <--- Dependency on videos is key!

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center bg-black">
				<Loader2 className="h-10 w-10 animate-spin text-primary-500" />
			</div>
		);
	}

	if (videos.length === 0) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-black text-white">
				<p className="mb-4 text-lg">No videos yet!</p>
				<p className="text-sm text-gray-400">Be the first to upload one.</p>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll bg-black scrollbar-hide"
		>
			{videos.map((video, index) => (
				<div
					key={video.id}
					data-index={index}
					className="reel-wrapper h-[100dvh] w-full snap-start"
				>
					<ReelCard video={video} isActive={activeIndex === index} />
				</div>
			))}
		</div>
	);
}