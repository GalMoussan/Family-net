import {
	collection, addDoc, query, where, orderBy,
	Timestamp, onSnapshot, limit, getDocs, doc, setDoc, updateDoc, getDoc
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ChatRoom, Message } from "../../types";

// 1. Create or Get Existing Chat
export const getOrCreateChat = async (currentUserId: string, targetUserId: string) => {
	// Simple query: find chat where participants array contains both
	// Note: Firestore array-contains is tricky for multiple values. 
	// For a family app (small scale), we can just query chats I'm in and filter client-side 
	// or use a composite key "uid1_uid2" (sorted).

	const sortedIds = [currentUserId, targetUserId].sort();
	const chatId = sortedIds.join("_");
	const chatRef = doc(db, "chats", chatId);

	const chatSnap = await getDoc(chatRef);

	if (chatSnap.exists()) {
		return { id: chatSnap.id, ...chatSnap.data() } as ChatRoom;
	}

	// Create new chat
	const newChat: Partial<ChatRoom> = {
		participants: sortedIds,
		lastMessage: null,
		updatedAt: Timestamp.now(),
	};

	await setDoc(chatRef, newChat);
	return { id: chatId, ...newChat } as ChatRoom;
};

// 2. Send Message
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
	const messagesRef = collection(db, "chats", chatId, "messages");
	const chatRef = doc(db, "chats", chatId);

	const newMessage = {
		senderId,
		text,
		createdAt: Timestamp.now(),
	};

	// Add message to subcollection
	await addDoc(messagesRef, newMessage);

	// Update parent chat with last message snippet
	await updateDoc(chatRef, {
		lastMessage: {
			text,
			createdAt: newMessage.createdAt,
			senderId,
			seen: false
		},
		updatedAt: newMessage.createdAt
	});
};

// 3. Subscribe to Messages (Real-time)
export const subscribeToMessages = (chatId: string, callback: (msgs: Message[]) => void) => {
	const q = query(
		collection(db, "chats", chatId, "messages"),
		orderBy("createdAt", "asc"),
		limit(100)
	);

	return onSnapshot(q, (snapshot) => {
		const messages = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		})) as Message[];
		callback(messages);
	});
};

// 4. Subscribe to Inbox (My Chats)
export const subscribeToInbox = (userId: string, callback: (chats: ChatRoom[]) => void) => {
	const q = query(
		collection(db, "chats"),
		where("participants", "array-contains", userId),
		orderBy("updatedAt", "desc")
	);

	return onSnapshot(q, (snapshot) => {
		const chats = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		})) as ChatRoom[];
		callback(chats);
	});
};