
import * as fs from "fs";
/**
 * getFileSize
 */
export const getFileSize: (_event, filePath) => Promise<number> = async (_event, filePath) => {
    try {
        // Use fs.statSync to get file stats
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            return stats.size; // Return file size if the path points to a file
        }
        throw new Error("The specified path is not a file"); // Throw an error if it's not a file
    } catch (err) {
        throw err; // Rethrow any error for the renderer to handle
    }
};