import cloudinary from "../config/cloudinary.config";

export default async function deleteFromCloudinary(
  public_id: string
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw new Error("Failed to delete image from Cloudinary");
  }
}
