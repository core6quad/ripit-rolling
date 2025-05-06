/**
 * src/main/utils/validation/media-schemas.zod.ts
 * Zod schemas for validating and cloning MediaFile data structures.
 * Used to validate incoming data against the expected MediaFile.Data format.
 */

import { z } from 'zod';

// Schema for MediaFile.Track
export const TrackSchema = z.object({
	formatId: z.string(),
	format: z.string().nullable(),
	ext: z.string(),
	vcodec: z.string().nullable(),
	acodec: z.string().nullable().optional(),
	url: z.string().nullable(),
	hasAudio: z.boolean().nullable(),
	hasVideo: z.boolean().nullable(),
	width: z.number().nullable().optional(),
	height: z.number().nullable().optional(),
	fps: z.number().nullable().optional(),
	tbr: z.number().nullable().optional(),
	abr: z.number().nullable().optional(),
	vbr: z.number().nullable().optional(),
	asr: z.number().nullable().optional(),
	filesize: z.number().nullable().optional(),
	eData: z.any().optional()
		.transform((d) => d?._type ? d : { _type: 'none' }), // any data with _type pass
}).strict();

// Schema for MediaFile.SourceFile
export const SourceFileSchema = z.object({
	id: z.string(),
	title: z.string(),
	extractor: z.string(),
	webpageUrl: z.string(),
	tracks: z.array(TrackSchema),
	playlistId: z.string().optional(),
	uploader: z.string().optional(),
	uploadDate: z.string().optional(),
	duration: z.number().optional(),
	description: z.string().optional(),
	thumbnail: z.string().optional(),
	tags: z.array(z.string()).optional(),
	// channelId: z.string().optional(), //UrlInfo
	eData: z.any().optional()
		.transform((d) => d?._type ? d : { _type: 'none' }), // any data with _type pass
}).strict();

// Schema for MediaFile.Data
export const MediaDataSchema = z.object({
	version: z.string(), // current version 1!
	id: z.string(),
	status: z.string(),
	trackIds: z.array(TrackSchema),
	fileName: z.string(),
	size: z.number().optional(),
	created: z.number().optional(),
	source: SourceFileSchema,
}).strict();

// Types inferred from schemas
export type ValidatedTrack = z.infer<typeof TrackSchema>;
export type ValidatedSource = z.infer<typeof SourceFileSchema>;
export type ValidatedMediaData = z.infer<typeof MediaDataSchema>;

// 
// FOR ANY CHANGES, ENABLE strictNullChecks FOR CHECKING!
//  = tsconfig.json
//  "strictNullChecks": true,
//  If the strictNullChecks option is enabled and the lines for type checks are uncommented, 
//  and no errors occur, everything is fine. 
//  However, if the strictNullChecks option is not enabled, the checks will never pass.
// 
type AssertExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : never) : never;
// const _1: AssertExact<MediaFile.Data, ValidatedMediaData> = true;
// const _2: AssertExact<MediaFile.Data, ValidatedMediaData> = true;
// const _3: AssertExact<MediaFile.Data, ValidatedMediaData> = true;


// remove optionality from props
type Clean<T> = {
	[K in keyof T]-?: T[K];
};