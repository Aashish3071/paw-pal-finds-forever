import { localDb } from "./localDb";

/**
 * Convert local file to base64 Data URL for persistent offline storage
 */
export const uploadFile = async (
  _bucket: "pet-images" | "avatars" | "post-images",
  file: File,
  _userId?: string
): Promise<string> => {
  return localDb.uploadFile(file);
};

export const uploadMultipleFiles = async (
  _bucket: "pet-images" | "avatars" | "post-images",
  files: File[],
  _userId?: string
): Promise<string[]> => {
  return Promise.all(files.map((file) => localDb.uploadFile(file)));
};

export const deleteFile = async (
  _bucket: "pet-images" | "avatars" | "post-images",
  _fileUrl: string
): Promise<void> => {
  // No-op for local storage data URLs
};

