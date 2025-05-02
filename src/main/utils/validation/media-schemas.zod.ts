/**
 * Zod schemas for validating and cloning MediaFile data structures.
 * Used to validate incoming data against the expected MediaFile.Data format.
 */

import { z } from 'zod';
import { MediaFile } from '../../../shared/types/media-file';

// Schema for MediaFile.Track
export const TrackSchema = z.object({
  formatId: z.string(),
  format: z.string(),
  ext: z.string(),
  vcodec: z.string(),
  acodec: z.string(),
  url: z.string(),
  hasAudio: z.boolean(),
  hasVideo: z.boolean(),
  width: z.number().optional(),
  height: z.number().optional(),
  fps: z.number().optional(),
  tbr: z.number().optional(),
  abr: z.number().optional(),
  vbr: z.number().optional(),
  asr: z.number().optional(),
  filesize: z.number().optional(),
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
}).strict();

// Schema for MediaFile.Data
export const MediaDataSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  size: z.number(),
  created: z.number(),
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