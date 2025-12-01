import { useEffect, useState, useRef } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { subscribeToComments, addComment } from "./feedService";
import { Comment } from "../../types";
import { cn } from "../../lib/utils";

interface CommentDrawerProps {
	videoId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

export function CommentDrawer({ videoId, isOpen, onClose }: CommentDrawerProps) {
	const { user } = useAuth();
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	// 1. Subscribe to comments when drawer opens
	useEffect(() => {
		if (!videoId || !isOpen) return;

		const unsubscribe = subscribeToComments(videoId, (fetchedComments) => {
			setComments(fetchedComments);
		});

		return () => unsubscribe();
	}, [videoId, isOpen]);

	// 2. Auto-scroll to bottom on new comments
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [comments]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newComment.trim() || !user || !videoId) return;

		setIsSubmitting(true);
		try {
			await addComment(videoId, newComment, user);
			setNewComment("");
		} catch (error) {
			console.error("Failed to post comment:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Drawer */}
			<div className={cn(
				"fixed bottom-0 left-0 right-0 z-50 flex h-[70vh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out",
				isOpen ? "translate-y-0" : "translate-y-full"
			)}>
				{/* Header */}
				<div className="flex items-center justify-between border-b p-4">
					<h3 className="text-center font-bold text-gray-900">Comments</h3>
					<button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
						<X size={24} className="text-gray-500" />
					</button>
				</div>

				{/* Comments List */}
				<div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
					{comments.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center text-gray-400">
							<p>No comments yet.</p>
							<p className="text-sm">Start the conversation!</p>
						</div>
					) : (
						<div className="flex flex-col gap-4">
							{comments.map((comment) => (
								<div key={comment.id} className="flex gap-3">
									<div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
										{comment.author.photoURL && (
											<img src={comment.author.photoURL} className="h-full w-full object-cover" />
										)}
									</div>
									<div className="flex flex-col">
										<span className="text-xs font-bold text-gray-600">
											{comment.author.displayName}
										</span>
										<p className="text-sm text-gray-900">{comment.text}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Input Form */}
				<form onSubmit={handleSubmit} className="border-t bg-gray-50 p-4 pb-8">
					<div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
						<input
							type="text"
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="Add a comment..."
							className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
							disabled={isSubmitting}
						/>
						<button
							type="submit"
							disabled={!newComment.trim() || isSubmitting}
							className="text-primary-500 disabled:opacity-50"
						>
							<Send size={20} />
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
