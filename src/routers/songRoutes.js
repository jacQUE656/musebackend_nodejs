import { Router } from "express";
import songController from "../controllers/songController.js";
import authenticate from "../middleware/authentication.js"
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";
import authorize from "../middleware/authorization.js";
import authorizeSongAccess from "../middleware/authorizeSongAccess.js";
import validateBody from "../validators/validateBody.js";
import { uploadSongFiles } from "../middleware/upload.js";
import { validateCreateSong, validateUpdateSong, validateSetPublic } from "../validators/songValidator.js";
import rbac from "../config/roles.js";

const { PERMISSIONS } = rbac;
const router = Router();

router.get("/", songController.listPublicSongs);
router.get("/mine", authenticate, songController.listMySongs);
router.get("/:id", optionalAuthenticate, songController.getSong);

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.SONG_CREATE),
  uploadSongFiles,
  validateBody(validateCreateSong),
  songController.createSong
);

router.patch(
  "/:id",
  authenticate,
  authorizeSongAccess("update"),
  validateBody(validateUpdateSong),
  songController.updateSong
);

router.patch(
  "/:id/publish",
  authenticate,
  authorizeSongAccess("publish"),
  validateBody(validateSetPublic),
  songController.setSongPublic
);

router.delete("/:id", authenticate, authorizeSongAccess("delete"), songController.deleteSong);

export default router;