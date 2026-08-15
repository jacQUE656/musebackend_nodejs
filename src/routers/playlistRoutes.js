import { Router } from "express";
import playlistController from "../controllers/playlistController.js";
import authenticate from "../middleware/authentication.js";
import authorize from "../middleware/authorization.js";
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";
import authorizePlaylistAccess from "../middleware/authorizePlaylistAccess.js";
import validateBody from "../validators/validateBody.js";
import { uploadCoverImage } from "../middleware/upload.js";
import {
  validateCreatePlaylist,
  validateUpdatePlaylist,
  validateAddSongToPlaylist,
  validateSetPublic,
} from "../validators/playlistValidator.js";
import rbac from "../config/roles.js";

const { PERMISSIONS } = rbac;
const router = Router();

router.get("/", playlistController.listPublicPlaylists);
router.get("/mine", authenticate, playlistController.listMyPlaylists);
router.get("/:id", optionalAuthenticate, playlistController.getPlaylist);

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.PLAYLIST_CREATE),
  uploadCoverImage,
  validateBody(validateCreatePlaylist),
  playlistController.createPlaylist,
);

router.patch(
  "/:id",
  authenticate,
  authorizePlaylistAccess("update"),
  validateBody(validateUpdatePlaylist),
  playlistController.updatePlaylist,
);

router.patch(
  "/:id/publish",
  authenticate,
  authorizePlaylistAccess("publish"),
  validateBody(validateSetPublic),
  playlistController.setPlaylistPublic,
);

router.post(
  "/:id/songs",
  authenticate,
  authorizePlaylistAccess("update"),
  validateBody(validateAddSongToPlaylist),
  playlistController.addSongToPlaylist,
);

router.delete(
  "/:id/songs/:songId",
  authenticate,
  authorizePlaylistAccess("update"),
  playlistController.removeSongFromPlaylist,
);

router.delete(
  "/:id",
  authenticate,
  authorizePlaylistAccess("delete"),
  playlistController.deletePlaylist,
);

export default router;
