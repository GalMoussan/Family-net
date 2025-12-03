import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import { ArticlePost } from "../../types";

// Upload the actual file binary
export const uploadVideoFile = (
	file: File,
	onProgress: (progress: number) => void
): Promise<string> => {
	return new Promise((resolve, reject) => {
		// Create a unique filename: videos/{timestamp}_{filename}
		const filename = `videos/${Date.now()}_${file.name}`;
		const storageRef = ref(storage, filename);

		const uploadTask = uploadBytesResumable(storageRef, file);

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				onProgress(progress);
			},
			(error) => {
				reject(error);
			},
			async () => {
				const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
				resolve(downloadURL);
			}
		);
	});
};

// Create the database record
export const createArticlePost = async (
	uid: string,
	videoURL: string,
	title: string,
	summary: string,
	externalLink: string,
	tags: string[],
	userDisplay: { name: string, photo: string }
) => {
	const newArticle: Omit<ArticlePost, "id"> = {
		uid,
		videoURL,
		thumbnailURL: "", // In a real app, we'd generate this server-side.
		title,
		summary,
		externalLink,
		tags,
		likes: [],
		commentCount: 0,
		createdAt: Timestamp.now(),
		author: {
			displayName: userDisplay.name,
			photoURL: userDisplay.photo,
		}
	};

	const docRef = await addDoc(collection(db, "videos"), newArticle);

	return docRef.id;
};