import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User, GalleryItem } from '../types';
import { Button } from '../components/Button';
import { ImageGrid } from '../components/ImageGrid';
import { VoiceInput } from '../components/VoiceInput';
import { commonStyles, colors } from '../styles/common';

interface GalleryScreenProps {
  user: User;
  items: GalleryItem[];
  isLoading: boolean;
  onAddItem: (uri: string, caption: string) => Promise<boolean>;
  onRemoveItem: (id: string) => Promise<boolean>;
  onSignOut: () => void;
}

export const GalleryScreen: React.FC<GalleryScreenProps> = ({
  user,
  items,
  isLoading,
  onAddItem,
  onRemoveItem,
  onSignOut,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission required', 'Camera permission is required to take photos');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert('Permission required', 'Gallery permission is required to select photos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleImageSelected = async (uri: string) => {
    setIsAdding(true);
    
    // For simplicity, we'll add the image without caption first
    // User can add caption later by pressing on the image
    const success = await onAddItem(uri, '');
    if (!success) {
      Alert.alert('Error', 'Failed to add image to gallery');
    }
    
    setIsAdding(false);
  };

  const handleItemPress = async (item: GalleryItem) => {
    if (Platform.OS === 'web') {
      // For web, show a dialog to add/edit caption
      Alert.prompt(
        'Add Caption',
        'Enter a caption for this image:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (caption) => {
              if (caption) {
                // Since we're using simple storage, we'll need to update the item
                // For now, we'll just show an alert that this feature would be implemented
                // in a real app with proper update functionality
                Alert.alert('Info', 'Caption update would be implemented with proper storage');
              }
            },
          },
        ],
        'plain-text',
        item.caption
      );
    } else {
      // For mobile, show action sheet with options
      Alert.alert(
        'Image Options',
        'Choose an action:',
        [
          { text: 'View Caption', onPress: () => viewCaption(item) },
          { text: 'Edit Caption', onPress: () => editCaption(item) },
          { text: 'Share', onPress: () => shareImage(item) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const viewCaption = (item: GalleryItem) => {
    Alert.alert('Caption', item.caption || 'No caption');
  };

  const editCaption = (item: GalleryItem) => {
    Alert.prompt(
      'Edit Caption',
      'Enter a new caption:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (caption) => {
            // Implementation for updating caption would go here
            Alert.alert('Info', 'Caption update would be implemented with proper storage');
          },
        },
      ],
      'plain-text',
      item.caption
    );
  };

  const shareImage = async (item: GalleryItem) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(item.uri, {
          dialogTitle: 'Share Image',
          mimeType: 'image/jpeg',
        });
      } else {
        Alert.alert('Sharing not available', 'Sharing is not available on this platform');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share image');
    }
  };

  const handleItemDelete = (item: GalleryItem) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await onRemoveItem(item.id);
            if (!success) {
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleVoiceTranscript = (transcript: string) => {
    // This would be used when adding a new image with voice caption
    // For now, we'll show an alert
    Alert.alert('Voice Input', `You said: ${transcript}`);
  };

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: commonStyles.screenContainer.padding,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
            />
          ) : (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>{user.name}</Text>
            <Text style={{ color: colors.textLight, fontSize: 12 }}>{user.email}</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={onSignOut}>
          <Icon name="logout" size={24} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={commonStyles.screenContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={commonStyles.title}>My Gallery</Text>
          <Text style={{ color: colors.textLight }}>{items.length} items</Text>
        </View>

        {/* Add Image Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Button
            title="Gallery"
            onPress={() => pickImage(false)}
            variant="secondary"
            style={{ flex: 1, marginRight: 8 }}
          />
          {Platform.OS !== 'web' && (
            <Button
              title="Camera"
              onPress={() => pickImage(true)}
              variant="secondary"
              style={{ flex: 1, marginLeft: 8 }}
            />
          )}
        </View>

        {/* Voice Input */}
        <VoiceInput onTranscript={handleVoiceTranscript} />

        {/* Gallery Grid */}
        {isLoading ? (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text>Loading gallery...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Icon name="photo-library" size={64} color={colors.textLight} />
            <Text style={{ marginTop: 16, color: colors.textLight }}>
              Your gallery is empty. Add some photos!
            </Text>
          </View>
        ) : (
          <ImageGrid
            items={items}
            onItemPress={handleItemPress}
            onItemDelete={handleItemDelete}
          />
        )}
      </ScrollView>

      {isAdding && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            padding: 24,
            borderRadius: 8,
          }}>
            <Text>Adding image...</Text>
          </View>
        </View>
      )}
    </View>
  );
};