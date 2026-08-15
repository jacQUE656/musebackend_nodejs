import { Router } from "express";
import albumController from "../controllers/albumController.js";
import authenticate from "../middleware/authentication.js"
import authorize from "../middleware/authorization.js";
import authorizeAlbumAccess from "../middleware/authorizeAlbumAccess.js";
import optionalAuthenticate from "../middleware/optionalAuthenticate.js";
import validateBody from "../validators/validateBody.js";
import { uploadCoverImage } from "../middleware/upload.js";
import { validateCreateAlbum, validateUpdateAlbum, validateSetPublic } from "../validators/albumValidator.js";
import rbac from "../config/roles.js";

const { PERMISSIONS } = rbac;
const router = Router();

router.get("/", albumController.listPublicAlbums);
router.get("/mine", authenticate, albumController.listMyAlbums);
router.get("/:id", optionalAuthenticate, albumController.getAlbum);

router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.ALBUM_CREATE),
  uploadCoverImage,
  validateBody(validateCreateAlbum),
  albumController.createAlbum
);

router.patch(
  "/:id",
  authenticate,
  authorizeAlbumAccess("update"),
  validateBody(validateUpdateAlbum),
  albumController.updateAlbum
);

router.patch(
  "/:id/publish",
  authenticate,
  authorizeAlbumAccess("publish"),
  validateBody(validateSetPublic),
  albumController.setAlbumPublic
);

router.delete("/:id", authenticate, authorizeAlbumAccess("delete"), albumController.deleteAlbum);

export default router;