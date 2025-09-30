import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Voice from '@react-native-voice/voice';

export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    setIsRecording(true);
    setError('');
  };

  const onSpeechEnd = () => {
    setIsRecording(false);
  };

  const onSpeechResults = (event: any) => {
    if (event.value && event.value.length > 0) {
      setTranscript(event.value[0]);
    }
  };

  const onSpeechError = (event: any) => {
    setError(event.error?.message || 'Voice recognition error');
    setIsRecording(false);
  };

  const startRecording = useCallback(async () => {
    try {
      setTranscript('');
      setError('');
      await Voice.start('en-US');
    } catch (error) {
      setError('Failed to start voice recognition');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      await Voice.stop();
    } catch (error) {
      setError('Failed to stop voice recognition');
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError('');
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript
  };
};