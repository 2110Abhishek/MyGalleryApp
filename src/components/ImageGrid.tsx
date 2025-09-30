import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { GalleryItem } from '../types';
import { commonStyles } from '../styles/common';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ImageGridProps {
  items: GalleryItem[];
  onItemPress: (item: GalleryItem) => void;
  onItemDelete?: (item: GalleryItem) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  onItemPress,
  onItemDelete,
}) => {
  return (
    <View style={commonStyles.grid}>
      {items.map((item) => (
        <View key={item.id} style={commonStyles.gridItem}>
          <TouchableOpacity onPress={() => onItemPress(item)}>
            <Image
              source={{ uri: item.uri }}
              style={{
                width: '100%',
                height: 150,
                borderRadius: 8,
              }}
              resizeMode="cover"
            />
            {item.caption ? (
              <Text 
                numberOfLines={2} 
                style={{ 
                  marginTop: 4,
                  fontSize: 12,
                  color: '#666'
                }}
              >
                {item.caption}
              </Text>
            ) : null}
          </TouchableOpacity>
          {onItemDelete && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 12,
                padding: 4,
              }}
              onPress={() => onItemDelete(item)}
            >
              <Icon name="delete" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};