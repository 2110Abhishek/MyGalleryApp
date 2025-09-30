import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform, Alert } from 'react-native';
import { commonStyles } from '../styles/common';

interface LoginScreenProps {
  onSignIn: () => void;
  isLoading: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn, isLoading }) => {
  const handleSignIn = async () => {
    try {
      await onSignIn();
    } catch (error: any) {
      if (Platform.OS === 'web') {
        Alert.alert('Sign-in Error', 'There was an issue with Google sign-in. Please try again.');
      } else {
        Alert.alert(
          'Mobile Sign-in', 
          'Using demo mode on mobile. For full Google authentication, please use the web version.'
        );
      }
    }
  };

  return (
    <View style={[commonStyles.container, commonStyles.screenContainer, {
      justifyContent: 'center',
      alignItems: 'center'
    }]}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: 100, height: 100, marginBottom: 32 }}
        onError={(e) => console.log('Image load error')} // Handle missing image
      />
      <Text style={[commonStyles.title, { textAlign: 'center' }]}>
        My Gallery
      </Text>
      <Text style={{ 
        textAlign: 'center', 
        marginBottom: 20,
        color: '#666',
        fontSize: 16
      }}>
        {Platform.OS === 'web' ? 'Sign in to start building your personal gallery' : 'Demo Mode - Mobile Version'}
      </Text>
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          minWidth: 200,
          alignItems: 'center',
          opacity: isLoading ? 0.7 : 1,
        }}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          {isLoading ? 'Signing In...' : (
            Platform.OS === 'web' ? 'Sign in with Google' : 'Start Demo'
          )}
        </Text>
      </TouchableOpacity>

      {Platform.OS !== 'web' && (
        <Text style={{ 
          marginTop: 20,
          color: '#666',
          fontSize: 12,
          textAlign: 'center',
          lineHeight: 16,
          backgroundColor: '#fff3cd',
          padding: 10,
          borderRadius: 5,
          borderWidth: 1,
          borderColor: '#ffeaa7',
          maxWidth: 300,
        }}>
          📱 Mobile version uses demo authentication.{'\n'}
          For full Google sign-in, use the web version.
        </Text>
      )}
      
      <Text style={{ 
        marginTop: 20,
        color: '#666',
        fontSize: 14,
      }}>
        Platform: {Platform.OS} {Platform.OS === 'web' ? '✅' : '📱'}
      </Text>
    </View>
  );
};