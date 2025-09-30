import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { commonStyles, colors } from '../styles/common';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        commonStyles.button,
        variant === 'secondary' && commonStyles.buttonSecondary,
        disabled && { opacity: 0.6 }
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={commonStyles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};