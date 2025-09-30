// src/utils/migration.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GalleryItem } from '../types';

const GALLERY_KEY = '@gallery_items';

export const migrateGalleryStorage = async (): Promise<void> => {
  try {
    const jsonValue = await AsyncStorage.getItem(GALLERY_KEY);
    if (!jsonValue) return;

    const items: GalleryItem[] = JSON.parse(jsonValue);
    
    // Filter out blob URIs and invalid items
    const validItems = items.filter(item => 
      item.uri && 
      !item.uri.startsWith('blob:') && 
      (item.uri.startsWith('data:') || item.uri.startsWith('file:') || item.uri.startsWith('http'))
    );

    if (validItems.length !== items.length) {
      console.log(`Migrating storage: removed ${items.length - validItems.length} invalid items`);
      await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(validItems));
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

export const clearBrokenImages = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GALLERY_KEY);
    console.log('Cleared all broken images from storage');
  } catch (error) {
    console.error('Error clearing broken images:', error);
  }
};