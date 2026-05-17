'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getWebSocketUrl } from '../utils/config';

export type FormData = {
  name: string;
  phone: string;
  jobTitle: string;
};

export type ChatMessage = {
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type RecordingStatus = 'idle' | 'recording' | 'processing';

export const useVoiceAgent = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    jobTitle: ''
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const recordingStatusRef = useRef<RecordingStatus>('idle');
  useEffect(() => {
    recordingStatusRef.current = recordingStatus;
  }, [recordingStatus]);

  const wsRef = useRef<any>(null);
  const isUnmountedRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    
    const priorityList = [
      'Microsoft Jenny',
      'Microsoft Aria',
      'Google US English',
      'Samantha',
      'Microsoft Zira'
    ];
    
    let bestVoice = null;
    for (const name of priorityList) {
      bestVoice = englishVoices.find(v => v.name.includes(name));
      if (bestVoice) break;
    }
    
    if (!bestVoice) {
      bestVoice = englishVoices[0] || voices[0];
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    utterance.onerror = () => setIsAISpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (wsRef.current && wsRef.current.readyState < 2) {
      return wsRef.current;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
    }

    setConnectionStatus('connecting');
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      if (isUnmountedRef.current) {
        ws.close();
        return;
      }
      setConnectionStatus('connected');
      ws.send(JSON.stringify({ type: 'connect', timestamp: new Date().toISOString() }));
    };

    ws.onmessage = (event) => {
      if (isUnmountedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'welcome') {
          setChatHistory(prev => [...prev, { type: 'assistant', message: data.message, timestamp: new Date() }]);
          speakText(data.message);
        } else if (data.type === 'chat_response') {
          if (data.user_message) setChatHistory(prev => [...prev, { type: 'user', message: data.user_message, timestamp: new Date() }]);
          if (data.ai_response) {
            setChatHistory(prev => [...prev, { type: 'assistant', message: data.ai_response, timestamp: new Date() }]);
            speakText(data.ai_response);
          }
        } else if (data.type === 'form_update' || data.action === 'field_updated') {
          if (data.action === 'form_submitted') {
            setIsSubmitted(true);
            const msg = "Form submitted successfully!";
            speakText(msg);
          } else {
            setFormData(prev => ({ ...prev, [data.field]: data.value }));
          }
        }
      } catch (e) {
        console.error('WS Error:', e);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      if (!isUnmountedRef.current) {
        setTimeout(connectWebSocket, 3000);
      }
    };

    wsRef.current = ws;
    return ws;
  }, [speakText]);

  useEffect(() => {
    isUnmountedRef.current = false;
    const wsInstance = connectWebSocket();
    return () => {
      isUnmountedRef.current = true;
      if (wsInstance) {
        try {
          wsInstance.close();
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (wsRef.current?.readyState === 1) {
            wsRef.current.send(JSON.stringify({
              type: 'chat',
              message: transcript,
              timestamp: new Date().toISOString()
            }));
          }
          setRecordingStatus('idle');
        };
        
        recognition.onerror = () => setRecordingStatus('idle');
        recognition.onend = () => setRecordingStatus('idle');
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = async () => {
    if (typeof window === 'undefined') return;
    
    if (recordingStatus === 'recording') {
      setRecordingStatus('processing');
      recognitionRef.current?.stop();
      audioContextRef.current?.close();
      return;
    }

    if (connectionStatus !== 'connected' || isSubmitted) return;

    try {
      setRecordingStatus('recording');
      recognitionRef.current?.start();
      
      const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a: number, b: number) => a + b, 0) / dataArray.length;
        setAudioLevel(avg / 128);
        
        if (recordingStatusRef.current === 'recording') {
          window.requestAnimationFrame(updateLevel);
        }
      };
      
      updateLevel();
    } catch (e) {
      console.error('Mic error:', e);
      setRecordingStatus('idle');
    }
  };

  return {
    formData,
    chatHistory,
    connectionStatus,
    recordingStatus,
    audioLevel,
    isAISpeaking,
    isSubmitted,
    toggleRecording
  };
};