// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GalleryItem } from '../types';
import { imageToBase64, isBlobUri } from './imageStorage';

const GALLERY_KEY = '@gallery_items';

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(GALLERY_KEY);
    const items = jsonValue != null ? JSON.parse(jsonValue) : [];
    console.log(`Retrieved ${items.length} items from storage`);
    return items;
  } catch (error) {
    console.error('Error getting gallery items:', error);
    return [];
  }
};

export const saveGalleryItem = async (item: Omit<GalleryItem, 'id'>): Promise<string> => {
  try {
    let imageUri = item.uri;
    
    // Convert blob URIs to base64 for permanent storage
    if (isBlobUri(item.uri)) {
      console.log('Converting blob URI to base64...');
      imageUri = await imageToBase64(item.uri);
    }
    
    const items = await getGalleryItems();
    const newItem: GalleryItem = {
      ...item,
      uri: imageUri,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const updatedItems = [newItem, ...items];
    await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(updatedItems));
    console.log('Saved new item with ID:', newItem.id);
    return newItem.id;
  } catch (error) {
    console.error('Error saving gallery item:', error);
    throw error;
  }
};

export const deleteGalleryItem = async (id: string): Promise<boolean> => {
  try {
    const items = await getGalleryItems();
    const initialLength = items.length;
    const updatedItems = items.filter(item => item.id !== id);
    
    if (updatedItems.length === initialLength) {
      console.log('No item found with ID:', id);
      return false;
    }
    
    await AsyncStorage.setItem(GALLERY_KEY, JSON.stringify(updatedItems));
    console.log(`Deleted item with ID: ${id}. Before: ${initialLength}, After: ${updatedItems.length}`);
    return true;
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    throw error;
  }
};

export const clearAllGalleryItems = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(GALLERY_KEY);
    console.log('Cleared all gallery items');
  } catch (error) {
    console.error('Error clearing gallery items:', error);
    throw error;
  }
};