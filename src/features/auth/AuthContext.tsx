import { createContext, useContext, useEffect, useState } from "react";
import {
	onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { AuthState, UserProfile } from "../../types";

interface AuthContextType extends AuthState {
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		loading: true,
		isAdmin: false,
	});

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				setState({ user: null, loading: false, isAdmin: false });
				return;
			}

			// User is logged in, try to fetch profile from Firestore
			try {
				const userDocRef = doc(db, "users", firebaseUser.uid);
				const userSnapshot = await getDoc(userDocRef);

				if (userSnapshot.exists()) {
					// Returning user
					const userData = userSnapshot.data() as UserProfile;
					setState({
						user: userData,
						loading: false,
						isAdmin: userData.role === "admin",
					});
				} else {
					// New user (Create the DB record automatically)
					const newUser: UserProfile = {
						uid: firebaseUser.uid,
						email: firebaseUser.email,
						displayName: firebaseUser.displayName || "Family Member",
						photoURL: firebaseUser.photoURL,
						role: "member", // Default role
						createdAt: Timestamp.now(),
					};

					await setDoc(userDocRef, newUser);

					setState({
						user: newUser,
						loading: false,
						isAdmin: false,
					});
				}
			} catch (error) {
				console.error("Error fetching user profile:", error);
				setState((prev) => ({ ...prev, loading: false }));
			}
		});

		return () => unsubscribe();
	}, []);

	const logout = () => auth.signOut();

	return (
		<AuthContext.Provider value={{ ...state, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

// Custom Hook for easy access
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};