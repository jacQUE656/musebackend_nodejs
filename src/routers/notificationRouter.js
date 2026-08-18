import { Router } from "express";
import authenticate from "../middleware/authentication.js"
import notificationController from "../controllers/notificationController.js"

const router = Router();

router.get("/", authenticate, notificationController.listMyNotifications);
router.get("/unread-count", authenticate, notificationController.unreadCount);
router.patch("/:id/read", authenticate , notificationController.markRead);
router.patch("/read-all", authenticate, notificationController.markAllRead);
router.delete("/:id" , notificationController.deleteNotification);

export default router;