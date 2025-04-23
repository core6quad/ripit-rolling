import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
	// Plugins configuration for Vue
	plugins: [vue()],

	build: {
		sourcemap: true,
		outDir: path.resolve(__dirname, "dist"), // Output directory for production build
		emptyOutDir: true, // Clean output directory before building
		// rollupOptions: {
		// 	input: 'src/renderer/index.html',
		// 	// output: {
		// 	// 	entryFileNames: "index.html",
				
		// 	// }
		// 	// input: path.resolve(__dirname, "src/renderer/index.html"), // Entry point for the app
		// 	output: {
		// 		assetFileNames: "src/renderer/[name].[hash][extname]", // Ensures JS/CSS are placed in "assets/"
		// 		entryFileNames: "src/renderer/[name].[hash].js", // For main JS files
		// 		chunkFileNames: "src/renderer/[name].[hash].js", // For dynamic imported modules
		// 	},
		// },
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"), // Alias "@" points to "src/"
			"@shared": path.resolve(__dirname, 'src/shared')
		},
	},
	base: "./", // Relative paths for assets in the final build
});