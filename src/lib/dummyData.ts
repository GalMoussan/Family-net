import { Timestamp } from "firebase/firestore";
import { ArticlePost } from "../types";

export const MOCK_ARTICLES: ArticlePost[] = [
	{
		id: "v1",
		uid: "user1",
		videoURL: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
		thumbnailURL: "https://via.placeholder.com/400x800",
		title: "Neon Signs: A History",
		summary: "An exploration of the history and science behind neon signs, from their invention to modern artistic applications.",
		externalLink: "https://google.com",
		tags: ["History", "Art", "Science"],
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
		title: "Botany 101: Spring Blooms",
		summary: "Understanding the biological mechanisms that trigger spring blooming in temperate climates.",
		externalLink: "https://google.com",
		tags: ["Biology", "Nature"],
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
		title: "The Psychology of Camping",
		summary: "How spending time in nature affects the human brain and social bonding in family units.",
		externalLink: "https://google.com",
		tags: ["Psychology", "Social Science"],
		likes: [],
		commentCount: 0,
		createdAt: Timestamp.now(),
		author: {
			displayName: "Sarah",
			photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
		},
	},
];