import { useRef, useEffect, useState } from "react";
import { Heart, MessageCircle, MoreVertical, Volume2, VolumeX } from "lucide-react";
import { VideoPost } from "@/types";
import { cn } from "../../lib/utils";

interface ReelCardProps {
	video: VideoPost;
	isActive: boolean; // Parent tells us if we are visible
}

export function ReelCard({ video, isActive }: ReelCardProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isMuted, setIsMuted] = useState(true);
	const [isLiked, setIsLiked] = useState(false); // Local state for immediate UI feedback

	// Play/Pause effect based on scroll position
	useEffect(() => {
		if (isActive) {
			videoRef.current?.play().catch((err) => console.log("Autoplay blocked:", err));
		} else {
			videoRef.current?.pause();
			videoRef.current!.currentTime = 0; // Reset loop
		}
	}, [isActive]);

	const toggleMute = () => setIsMuted(!isMuted);
	const toggleLike = () => setIsLiked(!isLiked);

	return (
		<div className="relative h-[100dvh] w-full snap-start bg-black">
			{/* Video Layer */}
			<video
				ref={videoRef}
				src={video.videoURL}
				className="h-full w-full object-cover"
				loop
				playsInline
				muted={isMuted}
				onClick={toggleMute} // Click video to unmute
			/>

			{/* Top Gradient for visibility */}
			<div className="absolute top-0 left-0 h-32 w-full bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

			{/* Mute Indicator (briefly shows on toggle) */}
			<button
				onClick={toggleMute}
				className="absolute top-20 right-4 z-20 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm"
			>
				{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
			</button>

			{/* Right Sidebar Actions */}
			<div className="absolute bottom-24 right-4 z-20 flex flex-col items-center gap-6">
				<div className="flex flex-col items-center gap-1">
					<button onClick={toggleLike} className="transition-transform active:scale-90">
						<Heart
							size={32}
							className={cn("transition-colors", isLiked ? "fill-primary-500 text-primary-500" : "text-white")}
						/>
					</button>
					<span className="text-sm font-medium text-white shadow-black drop-shadow-md">
						{video.likes.length + (isLiked ? 1 : 0)}
					</span>
				</div>

				<div className="flex flex-col items-center gap-1">
					<button className="transition-transform active:scale-90">
						<MessageCircle size={32} className="text-white" />
					</button>
					<span className="text-sm font-medium text-white shadow-black drop-shadow-md">
						{video.commentCount}
					</span>
				</div>

				<button className="transition-transform active:scale-90">
					<MoreVertical size={28} className="text-white" />
				</button>
			</div>

			{/* Bottom Info Overlay */}
			<div className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-24 pt-10">
				<div className="flex items-center gap-3 mb-3">
					{/* Avatar */}
					<div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white">
						<img src={video.author?.photoURL} alt={video.author?.displayName} className="h-full w-full object-cover" />
					</div>
					<span className="font-semibold text-white shadow-black drop-shadow-md">
						{video.author?.displayName}
					</span>
					<button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
						Follow
					</button>
				</div>

				<p className="text-white/90 line-clamp-2 shadow-black drop-shadow-md text-sm">
					{video.caption}
				</p>
			</div>
		</div>
	);
}