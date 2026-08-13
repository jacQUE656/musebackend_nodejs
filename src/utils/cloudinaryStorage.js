import cloudinary from "../config/cloudinary.js";

function uploadBuffer(buffer, { folder = "muse", resourceType = "auto" } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function destroyAsset(publicId, resourceType = "image") {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

// Cloudinary treats audio files under the "video" resource type — there's no
// separate "audio" type, so this just wraps destroyAsset with that mapping.
async function destroyAudio(publicId) {
  return destroyAsset(publicId, "video");
}

async function destroyImage(publicId) {
  return destroyAsset(publicId, "image");
}

export default { uploadBuffer, destroyAsset, destroyAudio, destroyImage };