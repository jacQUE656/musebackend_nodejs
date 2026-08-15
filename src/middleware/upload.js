import multer from "multer";

const storage = multer.memoryStorage();

const AUDIO_MIME_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/flac", "audio/ogg", "audio/mp4"];
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function fileFilter(req, file, cb) {
  if (file.fieldname === "audio") {
    if (!AUDIO_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid audio file type"));
    }
  }

  if (file.fieldname === "image") {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid image file type"));
    }
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB — covers most song files; raise if you expect longer/higher-bitrate tracks
  },
});

// For song creation: one audio file + one optional cover image
export const uploadSongFiles = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

// For album/playlist creation: single optional cover image
export const uploadCoverImage = upload.single("image");

export default upload;