import { z } from "zod";

export const validateCreateSong = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  artist: z.string().trim().min(1, "Artist is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  durationSec: z.coerce.number().int().positive().optional(),
  isPublic: z.coerce.boolean().optional().default(false),
  albumId: z.string().uuid("Invalid album id").optional(),
});

export const validateUpdateSong = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  artist: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  durationSec: z.coerce.number().int().positive().optional(),
  albumId: z.string().uuid("Invalid album id").optional().nullable(),
});

export const validateSetPublic = z.object({
  isPublic: z.boolean(),
});

