import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

interface UploadResponse {
  url: string;
  publicId: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  try {
    // Get Firebase storage
    const storage = getStorage();
    
    // Create a unique filename
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const imageRef = storageRef(storage, `images/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      publicId: filename
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const getImageUrl = (publicId: string): string => {
  // If it's already a complete URL, return it
  if (publicId.startsWith('http')) {
    return publicId;
  }
  // Otherwise construct the URL (fallback for legacy data)
  return `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
}; 