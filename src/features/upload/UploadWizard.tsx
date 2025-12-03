import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, X, Loader2, Wand2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { uploadVideoFile, createArticlePost } from "./uploadService";

export function UploadWizard() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const fileInputRef = useRef<HTMLInputElement>(null);

	const [file, setFile] = useState<File | null>(null);
	const [previewURL, setPreviewURL] = useState<string | null>(null);

	// New Fields
	const [title, setTitle] = useState("");
	const [tags, setTags] = useState("");
	const [externalLink, setExternalLink] = useState("");
	const [summary, setSummary] = useState("");

	const [isUploading, setIsUploading] = useState(false);
	const [isAutoFilling, setIsAutoFilling] = useState(false);
	const [progress, setProgress] = useState(0);

	const handleAutoFill = async () => {
		if (!externalLink) return;
		setIsAutoFilling(true);
		try {
			const response = await fetch('/api/summarize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: externalLink })
			});

			if (!response.ok) throw new Error("Failed to auto-fill");

			const data = await response.json();
			if (data.title) setTitle(data.title);
			if (data.summary) setSummary(data.summary);
			if (data.tags && Array.isArray(data.tags)) setTags(data.tags.join(", "));

		} catch (error) {
			console.error("Auto-fill error:", error);
			alert("Failed to auto-fill. Please check the link or try again.");
		} finally {
			setIsAutoFilling(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selected = e.target.files[0];
			setFile(selected);
			// Create local preview URL
			setPreviewURL(URL.createObjectURL(selected));
		}
	};

	const handleUpload = async () => {
		console.log("1. Button Clicked");

		if (!file) {
			console.error("Error: No file selected");
			return;
		}
		if (!user) {
			console.error("Error: No user found! You might be logged out.");
			alert("Error: You seem to be logged out. Refresh the page.");
			return;
		}

		console.log("2. Starting Upload...", { file: file.name, user: user.uid });
		setIsUploading(true);

		try {
			// 1. Upload File
			console.log("3. Uploading file to Storage...");
			const downloadURL = await uploadVideoFile(file, (prog) => {
				console.log("Upload Progress:", prog);
				setProgress(Math.round(prog));
			});
			console.log("4. File Uploaded! URL:", downloadURL);

			// 2. Create DB Record
			console.log("5. Creating Firestore Document...");

			// Process tags: split by comma, trim whitespace
			const tagArray = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);

			await createArticlePost(
				user.uid,
				downloadURL,
				title,
				summary,
				externalLink,
				tagArray,
				{
					name: user.displayName || "Family Member",
					photo: user.photoURL || ""
				}
			);
			console.log("6. Firestore Saved!");

			// 3. Success & Redirect
			navigate("/");
		} catch (error) {
			console.error("CRITICAL UPLOAD FAILURE:", error);
			alert("Upload failed. See console for details.");
			setIsUploading(false);
		}
	};

	// State 1: No File Selected
	if (!file) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-6 text-center">
				<div
					onClick={() => fileInputRef.current?.click()}
					className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100 active:scale-98"
				>
					<UploadCloud size={64} className="mb-4 text-primary-500" />
					<h3 className="text-xl font-bold text-gray-700">Select Video</h3>
					<p className="text-sm text-gray-400">Tap to browse your gallery</p>
				</div>
				<input
					type="file"
					accept="video/*"
					className="hidden"
					ref={fileInputRef}
					onChange={handleFileSelect}
				/>
			</div>
		);
	}

	// State 2: Preview & Metadata Form
	return (
		<div className="flex h-full flex-col bg-white">
			{/* Header */}
			<div className="flex items-center justify-between border-b p-4">
				<button onClick={() => setFile(null)} disabled={isUploading}>
					<X className="text-gray-500" />
				</button>
				<h2 className="font-bold">New Article</h2>
				<button
					onClick={handleUpload}
					disabled={isUploading || !title || !summary}
					className="font-bold text-primary-500 disabled:opacity-50"
				>
					{isUploading ? "..." : "Share"}
				</button>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				{/* Video Preview */}
				<div className="relative mb-6 aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black shadow-lg">
					{previewURL && (
						<video src={previewURL} className="h-full w-full object-cover" controls={false} autoPlay muted loop />
					)}

					{/* Upload Overlay */}
					{isUploading && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
							<Loader2 className="mb-2 h-10 w-10 animate-spin text-white" />
							<span className="font-bold text-white">{progress}%</span>
						</div>
					)}
				</div>

				{/* Metadata Inputs */}
				<div className="flex flex-col gap-4">
					{/* Title */}
					<div>
						<label className="mb-1 block text-sm font-bold text-gray-700">Title</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Article Title..."
							className="w-full rounded-lg border border-gray-300 p-3 font-bold outline-none focus:border-primary-500"
							disabled={isUploading}
						/>
					</div>

					{/* Tags */}
					<div>
						<label className="mb-1 block text-sm font-bold text-gray-700">Tags</label>
						<input
							type="text"
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							placeholder="Biology, AI, History..."
							className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-primary-500"
							disabled={isUploading}
						/>
					</div>

					{/* External Link */}
					<div>
						<label className="mb-1 block text-sm font-bold text-gray-700">External Link</label>
						<div className="flex gap-2">
							<input
								type="url"
								value={externalLink}
								onChange={(e) => setExternalLink(e.target.value)}
								placeholder="https://scholar.google.com/..."
								className="flex-1 rounded-lg border border-gray-300 p-3 outline-none focus:border-primary-500"
								disabled={isUploading || isAutoFilling}
							/>
							<button
								onClick={handleAutoFill}
								disabled={!externalLink || isAutoFilling || isUploading}
								className="flex items-center gap-2 rounded-lg bg-purple-100 px-4 font-bold text-purple-600 transition-colors hover:bg-purple-200 disabled:opacity-50"
							>
								{isAutoFilling ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
								Auto-Fill
							</button>
						</div>
					</div>

					{/* Summary */}
					<div>
						<label className="mb-1 block text-sm font-bold text-gray-700">Summary</label>
						<textarea
							value={summary}
							onChange={(e) => setSummary(e.target.value)}
							placeholder="Paste the abstract or summary here..."
							className="w-full resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-primary-500"
							rows={6}
							disabled={isUploading}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}