export namespace Formatters {
	/**
 * Converts a duration in seconds to a formatted string in HH:MM:SS format.
 *
 * @param seconds - Duration in seconds (can be number or unknown).
 * @returns Formatted duration string or '00:00:00' if input is invalid.
 *
 * @example
 * toDuration(3665); // "01:01:05"
 * toDuration('foo'); // "00:00:00"
 */
	export function toDuration(seconds: number | unknown): string | null {
		if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
			return null;
		}

		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);

		const hh = h.toString().padStart(2, '0');
		const mm = m.toString().padStart(2, '0');
		const ss = s.toString().padStart(2, '0');

		return `${hh}:${mm}:${ss}`;
	}

	/**
 * Formats a date string from "YYYYMMDD" to "YYYY<separator>MM<separator>DD".
 *
 * - Validates that the input is exactly 8 digits.
 * - Uses the specified separator between date parts (default is '.').
 * - Returns a fallback value if the input is invalid.
 *
 * @param raw - The raw date string (e.g. "20250424")
 * @param defaultValue - The value to return if input is invalid (default: "-")
 * @param separator - Separator between date parts (default: ".")
 * @returns Formatted date string or the default value
 */
export function formatShortDate(
	raw?: string,
	defaultValue = '-',
	separator = '.'
): string {
	if (!raw || !/^\d{8}$/.test(raw)) return defaultValue;

	return raw.replace(/(\d{4})(\d{2})(\d{2})/, `$1${separator}$2${separator}$3`);
}


	/**
 * Sanitizes a string to produce a safe file name.
 *
 * - Normalizes Unicode (NFKD) to flatten accented characters and emojis.
 * - Keeps common safe characters: letters, numbers, space, dot, underscore,
 *   dash, brackets, parentheses, #, &, @.
 * - Replaces `:`, `|`, `/` with a dash `-`.
 * - Replaces all other disallowed characters with underscore `_`.
 * - Collapses multiple underscores into a single `_`.
 * - Trims leading/trailing underscores and whitespace.
 *
 * @param input The original file name string (e.g. video title)
 * @returns Sanitized file name string
 */
export function sanitizeFileName(input: string): string {
	return input
		.normalize('NFKD') // Normalize Unicode (e.g. emojis, accented chars)
		.replace(/[^a-zA-Z0-9 ._\-\[\]()#&@]+/g, '_') // Replace disallowed chars with "_"
		.replace(/[:|/]+/g, '-') // Replace :, |, / with "-"
		.replace(/_+/g, '_') // Collapse multiple underscores
		.replace(/^_+|_+$/g, '') // Trim leading/trailing underscores
		.trim(); // Trim surrounding whitespace
}


}
