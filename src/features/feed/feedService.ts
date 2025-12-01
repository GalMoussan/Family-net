import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, orderBy, onSnapshot, Timestamp, increment } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Comment, UserProfile } from "../../types";

export const toggleLike = async (videoId: string, userId: string, isLiked: boolean) => {
	const videoRef = doc(db, "videos", videoId);

	if (isLiked) {
		// If currently liked, we want to UNLIKE (remove from array)
		await updateDoc(videoRef, {
			likes: arrayRemove(userId)
		});
	} else {
		// If not liked, we want to LIKE (add to array)
		await updateDoc(videoRef, {
			likes: arrayUnion(userId)
		});
	}
};

// Subscribe to comments for a specific video
export const subscribeToComments = (videoId: string, callback: (comments: Comment[]) => void) => {
	const q = query(
		collection(db, "videos", videoId, "comments"),
		orderBy("createdAt", "asc")
	);

	return onSnapshot(q, (snapshot) => {
		const comments = snapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		})) as Comment[];
		callback(comments);
	});
};

// Add a new comment
export const addComment = async (videoId: string, text: string, user: UserProfile) => {
	const videoRef = doc(db, "videos", videoId);
	const commentsRef = collection(db, "videos", videoId, "comments");

	const newComment = {
		text,
		author: {
			uid: user.uid,
			displayName: user.displayName || "Family Member",
			photoURL: user.photoURL
		},
		createdAt: Timestamp.now()
	};

	// 1. Add comment to subcollection
	await addDoc(commentsRef, newComment);

	// 2. Increment comment count on parent video
	await updateDoc(videoRef, {
		commentCount: increment(1)
	});
};
