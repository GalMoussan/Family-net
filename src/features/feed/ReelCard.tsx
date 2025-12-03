import { useRef, useEffect, useState } from "react";
import { Heart, MessageCircle, MoreVertical, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { ArticlePost } from "@/types";
import { cn } from "../../lib/utils";
import { useAuth } from "../auth/AuthContext";
import { toggleLike } from "./feedService";

interface ReelCardProps {
	video: ArticlePost;
	isActive: boolean; // Parent tells us if we are visible
	onCommentClick: () => void;
}

export function ReelCard({ video, isActive, onCommentClick }: ReelCardProps) {
	const { user } = useAuth();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [isMuted, setIsMuted] = useState(true);
	const [isExpanded, setIsExpanded] = useState(false);

	// Local state for immediate UI feedback
	// Initialize based on whether current user is in the likes array
	const [isLiked, setIsLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(video.likes.length);

	// Sync local state when video prop changes (e.g. initial load or feed refresh)
	useEffect(() => {
		if (user) {
			setIsLiked(video.likes.includes(user.uid));
		}
		setLikeCount(video.likes.length);
	}, [video.likes, user]);

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

	const handleLike = async () => {
		if (!user) return;

		// Optimistic Update
		const newLikedState = !isLiked;
		setIsLiked(newLikedState);
		setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

		try {
			// Call service
			await toggleLike(video.id, user.uid, isLiked);
		} catch (error) {
			console.error("Failed to toggle like:", error);
			// Revert on failure
			setIsLiked(!newLikedState);
			setLikeCount((prev) => (!newLikedState ? prev + 1 : prev - 1));
		}
	};

	// Double tap handler
	const lastTap = useRef<number>(0);
	const handleVideoClick = () => {
		const now = Date.now();
		const DOUBLE_TAP_DELAY = 300;

		if (now - lastTap.current < DOUBLE_TAP_DELAY) {
			// Double tap detected
			if (!isLiked) {
				handleLike();
			}
			// Optional: Trigger a heart animation overlay here
		} else {
			// Single tap - toggle mute
			toggleMute();
		}
		lastTap.current = now;
	};

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
				onClick={handleVideoClick} // Handle double tap vs single tap
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
					<button onClick={handleLike} className="transition-transform active:scale-90">
						<Heart
							size={32}
							className={cn("transition-colors", isLiked ? "fill-primary-500 text-primary-500" : "text-white")}
						/>
					</button>
					<span className="text-sm font-medium text-white shadow-black drop-shadow-md">
						{likeCount}
					</span>
				</div>

				<div className="flex flex-col items-center gap-1">
					<button onClick={onCommentClick} className="transition-transform active:scale-90">
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
			<div className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 pb-8 pt-24">

				{/* Tags */}
				<div className="mb-2 flex flex-wrap gap-2">
					{video.tags?.map((tag, i) => (
						<span key={i} className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-md">
							{tag}
						</span>
					))}
				</div>

				{/* Title */}
				<h2 className="mb-2 text-xl font-bold text-white shadow-black drop-shadow-md">
					{video.title}
				</h2>

				{/* Summary */}
				<div
					className="mb-4 cursor-pointer"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<p className={cn(
						"text-white/90 shadow-black drop-shadow-md text-sm leading-relaxed",
						!isExpanded && "line-clamp-3"
					)}>
						{video.summary}
					</p>
					{!isExpanded && (
						<span className="text-xs font-bold text-gray-300">Read More</span>
					)}
				</div>

				{/* Action Button */}
				{video.externalLink && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							window.open(video.externalLink, '_blank');
						}}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-bold text-black transition-transform active:scale-95"
					>
						<ExternalLink size={18} />
						Read Full Paper
					</button>
				)}
			</div>
		</div>
	);
}