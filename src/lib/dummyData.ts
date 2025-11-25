import { Timestamp } from "firebase/firestore";
import { VideoPost } from "../types";

export const MOCK_VIDEOS: VideoPost[] = [
	{
		id: "v1",
		uid: "user1",
		videoURL: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
		thumbnailURL: "https://via.placeholder.com/400x800",
		caption: "Family dinner night! 🍕 #pizza #friday",
		likes: ["a", "b", "c"],
		commentCount: 12,
		createdAt: Timestamp.now(),
		author: {
			displayName: "Uncle Bob",
			photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
		},
	},
	{
		id: "v2",
		uid: "user2",
		videoURL: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
		thumbnailURL: "https://via.placeholder.com/400x800",
		caption: "Look at the garden blooming 🌸",
		likes: ["a"],
		commentCount: 4,
		createdAt: Timestamp.now(),
		author: {
			displayName: "Grandma Sunny",
			photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny",
		},
	},
	{
		id: "v3",
		uid: "user3",
		videoURL: "https://assets.mixkit.co/videos/preview/mixkit-mother-with-her-little-daughter-eating-a-marshmallow-in-nature-39764-large.mp4",
		thumbnailURL: "https://via.placeholder.com/400x800",
		caption: "Camping trip 2024! 🔥",
		likes: [],
		commentCount: 0,
		createdAt: Timestamp.now(),
		author: {
			displayName: "Sarah",
			photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
		},
	},
];