import {
  getUserById,
  getAllUsers,
  updateUser,
  updateUserAvatar,
  getUserImagePublicId,
} from "../services/userService.js";
import cloudinaryService from "../utils/cloudinaryStorage.js";

// GET /users/me
// Assumes an auth middleware has attached req.user = { id, role }
async function getCurrentUser(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Not authenticated" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch user" });
  }
}

// PATCH /users/me
// Body: { firstname, lastname, phone }
async function updateMe(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Not authenticated" });
    }

    const { firstname, lastname, phone } = req.body;

    const user = await updateUser(userId, { firstname, lastname, phone });

    return res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    console.error("updateMe error:", error);
    return res.status(500).json({ status: "error", message: "Failed to update user" });
  }
}

// PATCH /users/me/avatar (multipart, field name: "image")
async function updateAvatar(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Not authenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No image file provided" });
    }

    const existing = await getUserImagePublicId(userId);

    const result = await cloudinaryService.uploadBuffer(req.file.buffer, {
      folder: "avatars",
      resourceType: "image",
    });
    const user = await updateUserAvatar(userId, {
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
    });

    // Best-effort cleanup — don't fail the request if this errors
    if (existing?.imagePublicId) {
      cloudinaryService
        .destroyImage(existing.imagePublicId)
        .catch((err) => console.error("Failed to delete old avatar from Cloudinary:", err));
    }

    return res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    console.error("updateAvatar error:", error);
    return res.status(500).json({ status: "error", message: "Failed to update avatar" });
  }
}

// GET /users/:id
async function getUser(req, res) {
  try {
    const { id } = req.params;

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    console.error("getUser error:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch user" });
  }
}

// GET /users
// Intended to be restricted to admins via route-level middleware
async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.status(200).json({ status: "success", data: { users } });
  } catch (error) {
    console.error("listUsers error:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch users" });
  }
}

export default { getCurrentUser, updateMe, updateAvatar, getUser, listUsers };