// src/services/imageStorage.ts
import { Platform } from 'react-native';

// Convert image to base64 for permanent storage
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    if (uri.startsWith('data:')) {
      return uri; // Already base64
    }
    
    if (Platform.OS === 'web') {
      // For web, convert blob to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // For mobile, we'll handle differently
      return uri;
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Check if URI is a blob URL
export const isBlobUri = (uri: string): boolean => {
  return uri.startsWith('blob:');
};