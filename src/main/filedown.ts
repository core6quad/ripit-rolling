import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { app, ipcMain, dialog } from 'electron';
import { spawn } from 'child_process'; // Import spawn from child_process

export function downloadFile(url: string, callback: (err: Error | null, data?: Buffer) => void) {
	https.get(url, (res) => {
		if (res.statusCode === 302 || res.statusCode === 301) {
			// Handle redirect
			const redirectUrl = res.headers.location;
			console.log(`Redirected to: ${redirectUrl}`);
			downloadFile(redirectUrl, callback); // Follow the redirect
		} else if (res.statusCode === 200) {
			// Handle successful response
			const chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const data = Buffer.concat(chunks);
				callback(null, data);
			});
		} else {
			callback(new Error(`Failed to download file: ${res.statusCode}`));
		}
	}).on('error', (err) => {
		callback(err);
	});
}
