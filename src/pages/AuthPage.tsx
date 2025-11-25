import { useState } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { Loader2, Mail, Lock, User } from "lucide-react";

export function AuthPage() {
	const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	// Form State
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState(""); // Only for Signup

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			if (isLogin) {
				// --- LOGIN MODE ---
				await signInWithEmailAndPassword(auth, email, password);
			} else {
				// --- SIGNUP MODE ---
				const userCredential = await createUserWithEmailAndPassword(auth, email, password);
				// Force update display name immediately so it saves to DB correctly
				await updateProfile(userCredential.user, {
					displayName: name,
					photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` // Random avatar
				});
			}
			// AuthContext listener will handle the redirection and DB creation
			navigate("/", { replace: true });
		} catch (err: any) {
			console.error(err);
			// Friendly error mapping
			if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
			else if (err.code === "auth/email-already-in-use") setError("Email already registered.");
			else if (err.code === "auth/weak-password") setError("Password must be 6+ chars.");
			else setError("Something went wrong. Try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-surface-dim p-4">
			<div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50">

				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-gray-900">
						{isLogin ? "Welcome Back" : "Join FamilyNet"}
					</h1>
					<p className="text-sm text-gray-500 mt-2">
						{isLogin ? "Sign in to see family updates" : "Create your private account"}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="flex flex-col gap-4">

					{/* Name Field (Signup Only) */}
					{!isLogin && (
						<div className="relative">
							<User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
							<input
								type="text"
								placeholder="Full Name"
								required
								className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 p-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
					)}

					{/* Email Field */}
					<div className="relative">
						<Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
						<input
							type="email"
							placeholder="Email Address"
							required
							className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 p-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					{/* Password Field */}
					<div className="relative">
						<Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
						<input
							type="password"
							placeholder="Password"
							required
							minLength={6}
							className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 p-3 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>

					{/* Error Message */}
					{error && <p className="text-xs text-red-500 text-center">{error}</p>}

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isLoading}
						className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 font-semibold text-white transition-transform active:scale-95 disabled:opacity-70"
					>
						{isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
					</button>
				</form>

				{/* Toggle Mode */}
				<div className="mt-6 text-center text-sm">
					<span className="text-gray-500">
						{isLogin ? "New to the family?" : "Already have an account?"}
					</span>
					<button
						type="button"
						onClick={() => setIsLogin(!isLogin)}
						className="ml-2 font-semibold text-primary-600 hover:underline"
					>
						{isLogin ? "Sign Up" : "Log In"}
					</button>
				</div>
			</div>
		</div>
	);
}