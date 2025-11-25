import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper to merge tailwind classes conditionally
// Usage: cn("bg-blue-500", isActive && "bg-blue-600")
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}