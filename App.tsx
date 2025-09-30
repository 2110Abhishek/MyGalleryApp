// App.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Platform, 
  TextInput, 
  Modal,
  LogBox 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './src/hooks/useAuth';
import { useGallery } from './src/hooks/useGallery';
import { clearAllGalleryItems } from './src/services/storage';

// Ignore specific warnings
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
]);

// Voice recognition hook
const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startRecording = () => {
    if (Platform.OS === 'web') {
      setIsRecording(true);
      setTranscript('');
      Alert.alert('Info', 'Speak now... Voice recording would use Web Speech API.');
      
      // Simulate voice input
      setTimeout(() => {
        setIsRecording(false);
        setTranscript('A beautiful sunset over the mountains');
      }, 3000);
    } else {
      Alert.alert('Voice Input', 'On mobile, voice input would use device microphone. For now, please type your caption.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript: () => setTranscript('')
  };
};

export default function App() {
  const { user, isLoading, error: authError, signIn, signOut } = useAuth();
  const { items, isLoading: galleryLoading, error: galleryError, addItem, removeItem, clearError } = useGallery(user?.id || '');
  const voiceRecognition = useVoiceRecognition();
  
  const [caption, setCaption] = useState('');
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Clear errors when they occur
  useEffect(() => {
    if (authError || galleryError) {
      const timer = setTimeout(() => {
        clearError?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError, galleryError, clearError]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        setShowCaptionModal(true);
        if (voiceRecognition.transcript) {
          setCaption(voiceRecognition.transcript);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddImage = async () => {
    if (!selectedImage) return;

    setUploading(true);
    const finalCaption = caption.trim() || 'My photo';
    
    try {
      const success = await addItem(selectedImage, finalCaption);
      
      if (success) {
        Alert.alert('Success', 'Image added to gallery!');
        setShowCaptionModal(false);
        setSelectedImage(null);
        setCaption('');
        voiceRecognition.clearTranscript();
      } else {
        Alert.alert('Error', 'Failed to add image to gallery');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Error', 'Failed to add image to gallery');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (itemId: string) => {
    setDeletingId(itemId);
    
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setDeletingId(null)
        },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              console.log('Starting delete process for:', itemId);
              const success = await removeItem(itemId);
              
              if (success) {
                Alert.alert('Success', 'Image deleted successfully!');
              } else {
                Alert.alert('Error', 'Failed to delete image. Please try again.');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'An unexpected error occurred while deleting the image.');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const handleSignIn = async () => {
    if (Platform.OS === 'web') {
      await signIn();
    } else {
      Alert.alert(
        'Sign In',
        Platform.OS === 'android' ? 
        'On Android, you will use a demo account to test the app.' :
        'On iOS, you will use a demo account to test the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: signIn }
        ]
      );
    }
  };

  // Debug function to clear storage
  const clearStorage = async () => {
    Alert.alert(
      'Clear Storage',
      'This will delete all images. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllGalleryItems();
              Alert.alert('Success', 'Storage cleared');
              // Reload the app
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to clear storage');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.platformInfo}>
          Platform: {Platform.OS} {Platform.OS === 'web' ? '✅' : '📱'}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>My Gallery App</Text>
        <Text style={styles.subtitle}>Sign in to manage your photos</Text>
        
        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>
            {Platform.OS === 'web' ? 'Sign in with Google' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.platformInfo}>
          Platform: {Platform.OS} {Platform.OS === 'web' ? '✅' : '📱'}
        </Text>
        
        {Platform.OS !== 'web' && (
          <Text style={styles.mobileInfo}>
            {Platform.OS === 'android' ? 
              'On Android, using demo account for testing' :
              'On iOS, using demo account for testing'}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
            {user.id.startsWith('mock-user-') && (
              <Text style={styles.demoBadge}>Demo Account</Text>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.debugButton} onPress={clearStorage}>
            <Text style={styles.debugButtonText}>🔄 Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Display */}
      {(authError || galleryError) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{authError || galleryError}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Gallery</Text>
        
        {/* Voice Input Section */}
        <View style={styles.voiceSection}>
          <Text style={styles.sectionTitle}>Add Caption</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.voiceButton, voiceRecognition.isRecording && styles.recordingButton]}
              onPress={voiceRecognition.isRecording ? voiceRecognition.stopRecording : voiceRecognition.startRecording}
            >
              <Text style={styles.voiceButtonText}>
                {voiceRecognition.isRecording ? '🛑 Stop Recording' : '🎤 Voice Input'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <Text style={styles.actionButtonText}>📁 Pick Image</Text>
            </TouchableOpacity>
          </View>
          
          {voiceRecognition.transcript ? (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Voice Caption:</Text>
              <Text style={styles.transcriptText}>{voiceRecognition.transcript}</Text>
              <TouchableOpacity 
                style={styles.useCaptionButton}
                onPress={() => {
                  setCaption(voiceRecognition.transcript);
                  setShowCaptionModal(true);
                }}
              >
                <Text style={styles.useCaptionButtonText}>Use this caption</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Gallery */}
        <Text style={styles.sectionTitle}>
          Your Images ({items.length})
        </Text>
        
        {galleryLoading ? (
          <View style={styles.loadingSection}>
            <Text>Loading your gallery...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No images yet. Add some photos to get started!
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Use voice input to add captions easily
            </Text>
          </View>
        ) : (
          <View style={styles.gallery}>
            {items.map((item) => (
              <View key={item.id} style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.image} 
                  resizeMode="cover"
                  onError={(e) => {
                    console.error('Error loading image:', item.id, e.nativeEvent.error);
                  }}
                />
                <Text style={styles.caption} numberOfLines={2}>
                  {item.caption}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.deleteButton,
                    deletingId === item.id && styles.deletingButton
                  ]}
                  onPress={() => handleDeleteImage(item.id)}
                  disabled={deletingId === item.id}
                >
                  <Text style={styles.deleteButtonText}>
                    {deletingId === item.id ? 'Deleting...' : '🗑️ Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Caption Modal */}
      <Modal
        visible={showCaptionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCaptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Caption</Text>
            
            <TextInput
              style={styles.captionInput}
              placeholder="Enter a caption for your image..."
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCaptionModal(false);
                  setSelectedImage(null);
                  setCaption('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton, uploading && styles.uploadingButton]}
                onPress={handleAddImage}
                disabled={!selectedImage || uploading}
              >
                <Text style={styles.addButtonText}>
                  {uploading ? 'Uploading...' : 'Add to Gallery'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  debugButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff6b35',
    borderRadius: 4,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  demoBadge: {
    fontSize: 10,
    color: '#ff6b35',
    fontWeight: '600',
    marginTop: 2,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  signOutText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  platformInfo: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
  mobileInfo: {
    marginTop: 15,
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  voiceSection: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  voiceButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recordingButton: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  voiceButtonText: {
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  transcriptContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  transcriptLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
  transcriptText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 8,
  },
  useCaptionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  useCaptionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: '47%',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  caption: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#ff4757',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  deletingButton: {
    backgroundColor: '#ff8a9e',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  errorBannerText: {
    color: '#c62828',
    textAlign: 'center',
  },
  loadingSection: {
    alignItems: 'center',
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  uploadingButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});