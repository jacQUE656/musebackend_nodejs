import { z } from "zod";

const hexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const validateCreateAlbum = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  artist: z.string().trim().min(1, "Artist is required").max(200),
  description: z.string().trim().max(2000).optional().default(""),
  bgColor: z.string().trim().regex(hexColor, "bgColor must be a valid hex color").optional().default("#1e1e1e"),
  isPublic: z.coerce.boolean().optional().default(false),
});

export const validateUpdateAlbum = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  artist: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  bgColor: z.string().trim().regex(hexColor, "bgColor must be a valid hex color").optional(),
});

export const validateSetPublic = z.object({
  isPublic: z.boolean(),
});

export const validateAddSongToAlbum = z.object({
  songId: z.string().uuid("Invalid song id"),
});
