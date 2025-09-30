import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

// Web client ID from Google Cloud Console
const EXPO_CLIENT_ID = 'your-expo-client-id.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'your-ios-client-id.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = 'your-android-client-id.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Here you would verify the token with your backend
      // or use it directly
    }
  }, [response]);

  return { request, response, promptAsync };
};

// Mock implementation for quick testing
export const useMockAuth = () => {
  const signIn = async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'mock-user-123',
          name: 'Test User',
          email: 'test@example.com',
          photoURL: 'https://via.placeholder.com/150'
        });
      }, 1000);
    });
  };

  const signOut = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  };

  return { signIn, signOut };
};