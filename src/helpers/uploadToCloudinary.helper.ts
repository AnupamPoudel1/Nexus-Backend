import { v2 as cloudinaryV2 } from "cloudinary"; // ensure v2 import for typings

export default function uploadToCloudinary(
  fileBuffer: Buffer,
  public_id: string,
  folder?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinaryV2.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id,
        folder,
      },
      (error, result) => {
        if (error) {
          return reject(new Error("Image upload failed: " + error.message));
        }
        resolve(result!.secure_url);
      }
    );

    stream.end(fileBuffer); // Send buffer to stream
  });
}
