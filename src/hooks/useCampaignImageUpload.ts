import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useCampaignImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const generateUploadUrl = useMutation(api.campaigns.generateUploadUrl);

  const uploadImage = async (file: File): Promise<Id<"_storage"> | null> => {
    if (!file) return null;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get a short-lived upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const { storageId } = await response.json();
      setUploadProgress(100);

      return storageId as Id<"_storage">;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadImageWithPreview = async (file: File) => {
    if (!file) return { storageId: null, previewUrl: "" };

    // Create local preview URL
    const previewUrl = URL.createObjectURL(file);

    try {
      const storageId = await uploadImage(file);
      return { storageId, previewUrl };
    } catch (error) {
      URL.revokeObjectURL(previewUrl);
      throw error;
    }
  };

  return {
    uploadImage,
    uploadImageWithPreview,
    isUploading,
    uploadProgress,
  };
}
