import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { useAuth } from '../hooks/useAuth';
import { useGallery } from '../hooks/useGallery';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { user, isLoading, signIn, signOut } = useAuth();
  const gallery = useGallery(user?.id || '');

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Gallery">
            {() => (
              <GalleryScreen
                user={user}
                items={gallery.items}
                isLoading={gallery.isLoading}
                onAddItem={gallery.addItem}
                onRemoveItem={gallery.removeItem}
                onSignOut={signOut}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {() => <LoginScreen onSignIn={signIn} isLoading={isLoading} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};