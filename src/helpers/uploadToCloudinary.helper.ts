import cloudinary from "../config/cloudinary.config";

export default async function uploadToCloudinary(
  image: string,
  public_id: string,
  folder?: string
): Promise<string> {
  try {
    const response = await cloudinary.uploader.upload(image, {
      resource_type: "auto",
      public_id,
      folder,
    });

    return response.secure_url;
  } catch (error: any) {
    throw new Error("Image upload failed");
  }
}
