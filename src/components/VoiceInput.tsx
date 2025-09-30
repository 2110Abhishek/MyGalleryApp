import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { commonStyles, colors } from '../styles/common';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript
  } = useVoiceRecognition();

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
      if (transcript) {
        onTranscript(transcript);
        clearTranscript();
      }
    } else {
      startRecording();
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handleRecordPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          backgroundColor: isRecording ? colors.error : colors.primary,
          borderRadius: 8,
          marginVertical: 8,
        }}
      >
        <Icon
          name={isRecording ? 'stop' : 'mic'}
          size={20}
          color="#FFFFFF"
        />
        <Text style={{ marginLeft: 8, color: '#FFFFFF', fontWeight: '600' }}>
          {isRecording ? 'Stop Recording' : 'Start Voice Input'}
        </Text>
      </TouchableOpacity>
      
      {transcript ? (
        <Text style={{ marginVertical: 8 }}>Transcript: {transcript}</Text>
      ) : null}
      
      {error ? (
        <Text style={{ color: colors.error, marginVertical: 8 }}>{error}</Text>
      ) : null}
    </View>
  );
};