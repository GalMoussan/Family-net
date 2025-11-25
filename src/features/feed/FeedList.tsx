import { useEffect, useRef, useState } from "react";
import { ReelCard } from "./ReelCard";
import { MOCK_VIDEOS } from "../../lib/dummyData";

export function FeedList() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Intersection Observer Configuration
		const options = {
			root: container,
			threshold: 0.6, // Video is considered "active" when 60% visible
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					// Read the data-index attribute we put on the wrapper
					const index = Number(entry.target.getAttribute("data-index"));
					setActiveIndex(index);
				}
			});
		}, options);

		// Observe all children (videos)
		const children = container.querySelectorAll(".reel-wrapper");
		children.forEach((child) => observer.observe(child));

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={containerRef}
			className="h-[100dvh] w-full snap-y snap-mandatory overflow-y-scroll bg-black scrollbar-hide"
		>
			{MOCK_VIDEOS.map((video, index) => (
				<div
					key={video.id}
					data-index={index}
					className="reel-wrapper h-[100dvh] w-full snap-start"
				>
					<ReelCard
						video={video}
						isActive={activeIndex === index}
					/>
				</div>
			))}
		</div>
	);
}