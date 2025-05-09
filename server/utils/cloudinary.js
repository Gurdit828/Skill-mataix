import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Existing functions
export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting media from Cloudinary:", error);
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
  }
};

// New helper function to extract publicId from Cloudinary URL
export const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    // Cloudinary URLs typically have the format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<publicId>.<ext>
    // We extract the part after the last '/' and before the last '.' as publicId
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const publicId = lastPart.substring(0, lastPart.lastIndexOf("."));
    return publicId;
  } catch (error) {
    console.error("Error extracting publicId from URL:", error);
    return null;
  }
};

// New function to upload media to Cloudinary
export const uploadMedia = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath);
    return result;
  } catch (error) {
    console.error("Error uploading media to Cloudinary:", error);
    throw error;
  }
};
