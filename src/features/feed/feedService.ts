import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../lib/firebase";

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
