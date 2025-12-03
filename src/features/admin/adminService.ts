import {
	collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ArticlePost } from "../../types";

export const getAllVideosAdmin = async () => {
	// Fetch ALL videos, newest first
	const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
	const snapshot = await getDocs(q);
	return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ArticlePost[];
};

export const deleteVideoAdmin = async (videoId: string) => {
	// Hard Delete
	await deleteDoc(doc(db, "videos", videoId));
};

export const toggleVideoVisibility = async (videoId: string, currentStatus: boolean) => {
	// Soft Delete (Hide/Show)
	await updateDoc(doc(db, "videos", videoId), {
		isVisible: !currentStatus
	});
};