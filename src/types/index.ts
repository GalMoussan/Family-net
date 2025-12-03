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
export interface ArticlePost {
	id: string;
	uid: string;
	videoURL: string;
	thumbnailURL: string;
	title: string;
	summary: string;
	externalLink: string;
	tags: string[];
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

export interface Comment {
	id: string;
	text: string;
	author: {
		uid: string;
		displayName: string;
		photoURL?: string;
	};
	createdAt: Timestamp;
}