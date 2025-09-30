// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { onAuthChange, signInWithGoogle, signOutUser } from '../services/firebase';
import { Platform } from 'react-native';

export const useAuth = (): AuthState & {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
} => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    const unsubscribe = onAuthChange((user) => {
      console.log('Auth state changed, user:', user ? 'exists' : 'null');
      setAuthState({
        user,
        isLoading: false,
        error: null
      });
    });

    // Safety timeout
    const timeoutId = setTimeout(() => {
      setAuthState(prev => {
        if (prev.isLoading) {
          console.log('Auth timeout reached, stopping loading');
          return { ...prev, isLoading: false };
        }
        return prev;
      });
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (Platform.OS !== 'web') {
        // For mobile, use a mock user
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          name: 'Demo User',
          email: 'demo@example.com',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
        };
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAuthState({
          user: mockUser,
          isLoading: false,
          error: null
        });
        return;
      }
      
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to sign in' 
      }));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      if (Platform.OS === 'web') {
        await signOutUser();
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setAuthState({
          user: null,
          isLoading: false,
          error: null
        });
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.message || 'Failed to sign out' 
      }));
    }
  };

  return {
    ...authState,
    signIn,
    signOut
  };
};