import { error } from "node:console";
import notifications from "../db_services/notificationService.js";

async function listMyNotifications(req, res) {
  try {
    const { skip, take, unreadOnly } = req.query;
    const result = await notifications.getByUser(req.user.userId, {
      skip: Number(skip) || 0,
      take: Number(take) || 30,
      unreadOnly: unreadOnly === "true",
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: " Failed to fetch notifications",
    });
  }
}

async function unreadCount(req, res) {
  try {
    const count = await notifications.getUnreadCount(req.user.userId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: " Failed to fetch notification count",
    });
  }
}

async function markRead(req, res) {
  try {
    const result = await notifications.markAsRead(
      req.params.id,
      req.user.userId,
    );
    if (result.count === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: " Failed to mark notification as read",
    });
  }
}

async function markAllRead(req, res) {
  try {
    const result = await notifications.markAllRead(req.user.userId);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: " Failed to mark notifications as read",
    });
  }
}

async function deleteNotification(req, res) {
  try {
    const result = await notifications.remove(req.params.id, req.user.userId);
    if (result.count === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: " Failed to delete notification",
    });
  }
}

export default {
  listMyNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
};
