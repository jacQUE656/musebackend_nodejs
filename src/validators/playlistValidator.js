import { z } from "zod";

export const validateCreatePlaylist = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  isPublic: z.coerce.boolean().optional().default(false),
});

export const validateUpdatePlaylist = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
});

export const validateAddSongToPlaylist = z.object({
  songId: z.string().uuid("Invalid song id"),
});

export const validateSetPublic = z.object({
  isPublic: z.boolean(),
});