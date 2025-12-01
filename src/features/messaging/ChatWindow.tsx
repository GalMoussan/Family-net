import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Message, UserProfile } from "../../types";
import { subscribeToMessages, sendMessage } from "./chatService";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../../lib/utils";

interface ChatWindowProps {
	chatId: string;
	recipient: UserProfile; // Who are we talking to?
	onClose: () => void; // Go back to list
}

export function ChatWindow({ chatId, recipient, onClose }: ChatWindowProps) {
	const { user } = useAuth();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	// Subscribe to real-time messages
	useEffect(() => {
		const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
			setMessages(newMessages);
		});
		return () => unsubscribe();
	}, [chatId]);

	// Auto-scroll to bottom on new message
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputText.trim() || !user) return;

		const text = inputText;
		setInputText(""); // Optimistic clear

		await sendMessage(chatId, user.uid, text);
	};

	return (
		<div className="flex h-full flex-col bg-surface-dim absolute inset-0 z-20 md:relative">
			{/* Header */}
			<div className="flex items-center gap-3 border-b bg-white p-4 shadow-sm">
				<button onClick={onClose} className="md:hidden">
					<ArrowLeft size={24} />
				</button>
				<div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
					{recipient.photoURL && <img src={recipient.photoURL} className="h-full w-full object-cover" />}
				</div>
				<span className="font-semibold">{recipient.displayName}</span>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
				<div className="flex flex-col gap-3">
					{messages.map((msg) => {
						const isMe = msg.senderId === user?.uid;
						return (
							<div
								key={msg.id}
								className={cn(
									"max-w-[80%] rounded-2xl px-4 py-2 text-sm",
									isMe
										? "self-end bg-primary-500 text-white rounded-tr-none"
										: "self-start bg-white text-gray-800 border border-gray-100 rounded-tl-none"
								)}
							>
								{msg.text}
							</div>
						);
					})}
				</div>
			</div>

			{/* Input Area */}
			<form onSubmit={handleSend} className="bg-white p-3 md:p-4 border-t">
				<div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
					<input
						className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-gray-400"
						placeholder="Message..."
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
					/>
					<button
						type="submit"
						disabled={!inputText.trim()}
						className="text-primary-500 disabled:opacity-50 font-semibold"
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
}