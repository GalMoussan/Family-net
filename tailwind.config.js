/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				// Primary Brand Color (Warm, Family-oriented)
				primary: {
					50: "#fff1f2",
					100: "#ffe4e6",
					500: "#f43f5e", // Rose-500
					600: "#e11d48",
				},
				// Surface colors for cards/backgrounds
				surface: {
					light: "#ffffff",
					dim: "#f8fafc", // Slate-50
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
			},
			// Custom mobile-first heights
			height: {
				"screen-dvh": "100dvh", // Dynamic Viewport Height for mobile browsers
			},
		},
	},
	plugins: [],
};
