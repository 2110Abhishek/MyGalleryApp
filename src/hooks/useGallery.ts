// src/hooks/useGallery.ts
import { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { getGalleryItems, saveGalleryItem, deleteGalleryItem } from '../services/storage';

export const useGallery = (userId: string) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, [userId]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allItems = await getGalleryItems();
      const userItems = userId ? allItems.filter(item => item.createdBy === userId) : allItems;
      console.log(`Loaded ${userItems.length} items for user ${userId}`);
      setItems(userItems);
    } catch (error) {
      console.error('Error loading gallery items:', error);
      setError('Failed to load gallery items');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (uri: string, caption: string = 'New Image') => {
    try {
      if (!userId) {
        throw new Error('User must be logged in to add items');
      }

      setError(null);
      const newItem = {
        uri,
        caption,
        createdAt: Date.now(),
        createdBy: userId
      };
      
      await saveGalleryItem(newItem);
      await loadItems(); // Reload to get the updated list
      return true;
    } catch (error) {
      console.error('Error adding gallery item:', error);
      setError('Failed to add image to gallery');
      return false;
    }
  };

  const removeItem = async (id: string) => {
    try {
      setError(null);
      console.log('Attempting to delete item with ID:', id);
      
      const success = await deleteGalleryItem(id);
      console.log('Delete operation result:', success);
      
      if (success) {
        // Reload items to ensure UI is in sync with storage
        await loadItems();
        return true;
      } else {
        setError('Image not found or already deleted');
        return false;
      }
    } catch (error) {
      console.error('Error removing gallery item:', error);
      setError('Failed to delete image');
      return false;
    }
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    removeItem,
    refreshItems: loadItems,
    clearError: () => setError(null)
  };
};