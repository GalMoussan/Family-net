import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { ChatRoom, UserProfile } from "../types";
import { subscribeToInbox } from "../features/messaging/chatService";
import { ChatWindow } from "../features/messaging/ChatWindow";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function MessagesPage() {
	const { user } = useAuth();
	const [chats, setChats] = useState<ChatRoom[]>([]);
	const [activeChat, setActiveChat] = useState<{ id: string; user: UserProfile } | null>(null);

	useEffect(() => {
		if (!user) return;

		// Subscribe to inbox
		const unsubscribe = subscribeToInbox(user.uid, async (chatList) => {
			// We need to fetch the "other person's" profile for each chat
			const hydratedChats = await Promise.all(chatList.map(async (chat) => {
				const otherUserId = chat.participants.find(uid => uid !== user.uid);
				if (!otherUserId) return chat;

				// Simple fetch - in production use a cache or context
				const userSnap = await getDoc(doc(db, "users", otherUserId));
				const otherUserData = userSnap.exists() ? userSnap.data() as UserProfile : undefined;

				return {
					...chat,
					participantData: otherUserData ? { [otherUserId]: otherUserData } : undefined
				};
			}));
			setChats(hydratedChats);
		});

		return () => unsubscribe();
	}, [user]);

	// Derive display data helper
	const getDisplayData = (chat: ChatRoom) => {
		const otherId = chat.participants.find(p => p !== user?.uid);
		if (!otherId || !chat.participantData) return { name: 'User', photo: '' };
		return {
			uid: otherId,
			name: chat.participantData[otherId]?.displayName || 'Unknown',
			photo: chat.participantData[otherId]?.photoURL || ''
		};
	};

	if (activeChat) {
		return (
			<div className="h-[calc(100vh-64px)] md:h-screen">
				<ChatWindow
					chatId={activeChat.id}
					recipient={activeChat.user}
					onClose={() => setActiveChat(null)}
				/>
			</div>
		);
	}

	return (
		<div className="p-4 pt-8">
			<h1 className="mb-6 text-2xl font-bold">Messages</h1>

			<div className="flex flex-col gap-2">
				{chats.length === 0 && (
					<div className="text-center text-gray-400 mt-10">
						No messages yet.
					</div>
				)}

				{chats.map((chat) => {
					const { uid, name, photo } = getDisplayData(chat);
					return (
						<button
							key={chat.id}
							onClick={() => setActiveChat({ id: chat.id, user: { uid, displayName: name, photoURL: photo } as UserProfile })}
							className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-transform active:scale-98"
						>
							<div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
								{photo && <img src={photo} alt={name} className="h-full w-full object-cover" />}
							</div>
							<div className="flex-1 text-left">
								<h3 className="font-semibold text-gray-900">{name}</h3>
								<p className="text-sm text-gray-500 line-clamp-1">
									{chat.lastMessage?.text || "Start a conversation"}
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}