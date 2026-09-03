import { Router } from "express";
import userController from "../controllers/userController.js";
import authenticate from "../middleware/authentication.js";
import authorize from "../middleware/authorization.js";
import validateBody from "../validators/validateBody.js";
import { uploadCoverImage } from "../middleware/upload.js";
import { validateUpdateUser } from "../validators/userValidator.js";
import rbac from "../config/roles.js";

const { PERMISSIONS } = rbac;
const router = Router();

router.get("/me", authenticate, userController.getCurrentUser);

router.patch(
  "/me",
  authenticate,
  validateBody(validateUpdateUser),
  userController.updateMe
);

router.patch(
  "/me/avatar",
  authenticate,
  uploadCoverImage,
  userController.updateAvatar
);

router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.USER_LIST),
  userController.listUsers
);

router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.USER_READ_ANY),
  userController.getUser
);

export default router;