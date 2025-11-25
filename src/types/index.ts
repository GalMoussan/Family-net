// FILE: src/types/index.ts
import { Timestamp } from "firebase/firestore";

// --- USER TYPES ---
export type UserRole = "admin" | "member";

export interface UserProfile {
	uid: string;
	email: string | null;
	displayName: string;
	photoURL: string | null;
	bio?: string;
	role: UserRole;
	createdAt: Timestamp;
}

export interface AuthState {
	user: UserProfile | null;
	loading: boolean;
	isAdmin: boolean;
}

// --- VIDEO TYPES (Ensure this is here!) ---
export interface VideoPost {
	id: string;
	uid: string;
	videoURL: string;
	thumbnailURL: string;
	caption: string;
	likes: string[]; // Array of User IDs
	commentCount: number;
	createdAt: Timestamp;
	author?: {
		displayName: string;
		photoURL: string;
	};
}

// ... existing imports

export interface ChatRoom {
	id: string;
	participants: string[]; // [uid1, uid2]
	lastMessage: {
		text: string;
		createdAt: Timestamp;
		senderId: string;
		seen: boolean;
	} | null;
	updatedAt: Timestamp;
	participantData?: Record<string, UserProfile>; // Optional hydrated data for UI
}

export interface Message {
	id: string;
	senderId: string;
	text: string;
	mediaURL?: string;
	createdAt: Timestamp;
}