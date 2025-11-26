import { useEffect, useState } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { ChatRoom, UserProfile } from "../types";
import { subscribeToInbox } from "../features/messaging/chatService";
import { ChatWindow } from "../features/messaging/ChatWindow";
import { doc, getDoc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { MessageSquarePlus, UserPlus } from "lucide-react";

export function MessagesPage() {
	const { user } = useAuth();
	const [chats, setChats] = useState<ChatRoom[]>([]);
	const [activeChat, setActiveChat] = useState<{ id: string; user: UserProfile } | null>(null);
	const [isSimulating, setIsSimulating] = useState(false);

	useEffect(() => {
		if (!user) return;

		// Subscribe to inbox
		const unsubscribe = subscribeToInbox(user.uid, async (chatList) => {
			const hydratedChats = await Promise.all(chatList.map(async (chat) => {
				const otherUserId = chat.participants.find(uid => uid !== user.uid);
				if (!otherUserId) return chat;

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

	const getDisplayData = (chat: ChatRoom) => {
		const otherId = chat.participants.find(p => p !== user?.uid);
		if (!otherId || !chat.participantData) return { name: 'User', photo: '' };
		return {
			uid: otherId,
			name: chat.participantData[otherId]?.displayName || 'Unknown',
			photo: chat.participantData[otherId]?.photoURL || ''
		};
	};

	// --- DEBUG VERSION ---
	const simulateIncomingChat = async () => {
		console.log("--- STARTING SIMULATION ---");

		if (!user) {
			console.error("❌ ERROR: No user found. You might be logged out.");
			return;
		}
		console.log("1. Current User ID:", user.uid);

		setIsSimulating(true);

		try {
			const botId = "grandma_sunny";
			console.log("2. Target Bot ID:", botId);

			// 1. Create Grandma
			console.log("3. Writing Grandma to 'users' collection...");
			await setDoc(doc(db, "users", botId), {
				uid: botId,
				displayName: "Grandma Sunny",
				email: "grandma@test.com",
				photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny",
				role: "member",
				createdAt: Timestamp.now()
			});
			console.log("✅ Grandma User Created.");

			// 2. Create Chat Room
			const sortedIds = [user.uid, botId].sort();
			const chatId = sortedIds.join("_");
			console.log("4. Generated Chat ID:", chatId);

			const initialMsg = {
				text: "Hello dear! Is this the new family app? 🍪",
				senderId: botId,
				createdAt: Timestamp.now(),
				seen: false
			};

			console.log("5. Writing Chat Document...");
			await setDoc(doc(db, "chats", chatId), {
				participants: sortedIds,
				lastMessage: initialMsg,
				updatedAt: Timestamp.now()
			});
			console.log("✅ Chat Room Created.");

			// 3. Add Message
			console.log("6. Adding Message to subcollection...");
			await addDoc(collection(db, "chats", chatId, "messages"), {
				...initialMsg,
				type: 'text'
			});
			console.log("✅ Message Added. DONE.");

		} catch (error) {
			console.error("❌ CRITICAL FAILURE:", error);
			alert("Check Console for Error Details");
		} finally {
			setIsSimulating(false);
		}
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
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Messages</h1>

				{/* DEBUG BUTTON */}
				<button
					onClick={simulateIncomingChat}
					disabled={isSimulating}
					className="flex items-center gap-2 text-xs font-medium text-primary-600 bg-primary-50 px-3 py-2 rounded-lg hover:bg-primary-100"
				>
					<UserPlus size={16} />
					{isSimulating ? "Adding..." : "Add Grandma"}
				</button>
			</div>

			<div className="flex flex-col gap-2">
				{chats.length === 0 && (
					<div className="flex flex-col items-center justify-center mt-20 text-gray-400 gap-4">
						<MessageSquarePlus size={48} className="text-gray-200" />
						<p>No messages yet.</p>
						<p className="text-sm">Click "Add Grandma" to test!</p>
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
									{chat.lastMessage?.senderId === user?.uid ? "You: " : ""}
									{chat.lastMessage?.text || "Start a conversation"}
								</p>
							</div>
							<div className="text-xs text-gray-300">
								now
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}