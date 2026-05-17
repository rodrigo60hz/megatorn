"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Power, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

const SILENCE_WAV = "data:audio/wav;base64,UklGRjIAAABXQVZFRm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YfIAAACAgICAgICAgICAgICAgICAgIA=";

export function VoiceLink({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const isSystemActiveRef = useRef(false);
  const isProcessingRef = useRef(false);

  const ensureAudioContext = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const handleProcessInput = async (query: string) => {
    if (isProcessingRef.current || !query.trim()) return;
    isProcessingRef.current = true;
    onProcessingChange(true);
    setIsTransmitting(true);

    try {
      const result = await aiVoiceInteraction(query);
      setIsTransmitting(false);
      await ensureAudioContext();
      if (result.audio && audioRef.current) {
        audioRef.current.src = result.audio;
        await audioRef.current.play();
      }
    } catch (err) {
      console.error("ERRO_MEGATRON_A:", err);
    } finally {
      isProcessingRef.current = false;
      onProcessingChange(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.lang = 'pt-BR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) handleProcessInput(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.onplay = () => {
        setIsPlaying(true);
        setIsListening(false);
      };
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }
  }, []);

  const toggleSystemPower = async () => {
    if (isActive) {
      setIsActive(false);
      isSystemActiveRef.current = false;
      recognitionRef.current?.stop();
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      await ensureAudioContext();
      if (audioRef.current) {
        audioRef.current.src = SILENCE_WAV;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="pointer-events-auto">
        <Button 
          onClick={toggleSystemPower}
          className={cn(
            "w-64 h-64 rounded-full border-[1px] transition-all duration-700 relative z-10",
            !isActive ? "bg-black/80 border-primary/20" :
            isPlaying ? "bg-primary/20 border-primary shadow-[0_0_100px_#FFBF00] scale-105" :
            isListening ? "bg-primary/30 border-primary animate-pulse" :
            "bg-transparent border-primary/40"
          )}
        >
          {!isActive ? (
            <Power className="w-16 h-16 text-primary/20" />
          ) : isPlaying ? (
            <div className="flex gap-1.5 items-end justify-center h-24">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 bg-primary rounded-full animate-bounce" style={{ height: `${30 + Math.random() * 50}px`, animationDuration: `${0.2 + i * 0.1}s` }} />
              ))}
            </div>
          ) : isListening ? (
            <Mic className="w-16 h-16 text-primary drop-shadow-[0_0_20px_#FFBF00]" />
          ) : (
            <BrainCircuit className="w-16 h-16 text-primary/40 animate-pulse" />
          )}
        </Button>
      </div>
    </div>
  );
}
