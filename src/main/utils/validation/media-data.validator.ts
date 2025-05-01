/**
 * MediaFile.Data array validator using Zod schema.
 * Returns a list of valid cloned objects and detailed invalid entries.
 */

import { MediaFile } from '../../../shared/types/media-file';
import { MediaDataSchema } from './media-schemas.zod';

export namespace MediaFileValidation {

	export type InvalidRecord = {
		index: number,
		error: string,
		record: unknown,
	};

	export type Result = {
		valid: Array<MediaFile.Data>,
		invalid: Array<InvalidRecord>
	}

	export function validatedClone(data: unknown): Result {
		if (!Array.isArray(data)) {
			return {
				valid: [],
				invalid: [{
					index: -1,
					error: 'Root value is not an array',
					record: data
				}]
			};
		}

		const valid: MediaFile.Data[] = [];
		const invalid: Result['invalid'] = [];

		data.forEach((entry, index) => {
			const parsed = MediaDataSchema.safeParse(entry);
			if (parsed.success) {
				valid.push(parsed.data as MediaFile.Data);
			} else {
				const msg = parsed.error.issues.map(issue =>
					`${issue.path.join('.')}: ${issue.message}`
				).join('; ');
				invalid.push({ index, error: msg, record: entry });
			}
		});

		return { valid, invalid };
	}
}
