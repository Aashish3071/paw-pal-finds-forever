import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase Storage
 * @param bucket - The storage bucket name ('pet-images', 'avatars', 'post-images')
 * @param file - The file to upload
 * @param userId - The user's ID (for folder organization)
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (
  bucket: "pet-images" | "avatars" | "post-images",
  file: File,
  userId: string
): Promise<string> => {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.");
  }

  // Validate file size (5MB for images)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB.");
  }

  // Generate a unique filename with user folder
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

/**
 * Upload multiple files to Supabase Storage
 * @param bucket - The storage bucket name
 * @param files - Array of files to upload
 * @param userId - The user's ID
 * @returns Array of public URLs
 */
export const uploadMultipleFiles = async (
  bucket: "pet-images" | "avatars" | "post-images",
  files: File[],
  userId: string
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadFile(bucket, file, userId));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The path to the file (without bucket prefix)
 */
export const deleteFile = async (
  bucket: "pet-images" | "avatars" | "post-images",
  fileUrl: string
): Promise<void> => {
  // Extract the file path from the URL
  const bucketUrl = `/storage/v1/object/public/${bucket}/`;
  const urlIndex = fileUrl.indexOf(bucketUrl);
  if (urlIndex === -1) {
    console.warn("Could not extract file path from URL:", fileUrl);
    return;
  }
  
  const filePath = fileUrl.substring(urlIndex + bucketUrl.length);
  
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  
  if (error) {
    console.error("Delete error:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};
