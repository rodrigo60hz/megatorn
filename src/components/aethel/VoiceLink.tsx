
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, BrainCircuit } from 'lucide-react';
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
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

    try {
      const result = await aiVoiceInteraction(query);
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
      recognition.continuous = true;
      recognition.lang = 'pt-BR';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[event.results.length - 1][0].transcript;
        if (text) handleProcessInput(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isActive) recognition.start(); // Auto-restart para escuta contínua
      };
      recognitionRef.current = recognition;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.onplay = () => {
        setIsPlaying(true);
        setIsListening(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setIsListening(true);
      };
      audioRef.current = audio;
    }
  }, [isActive]);

  const toggleSystemPower = async () => {
    if (isActive) {
      setIsActive(false);
      recognitionRef.current?.stop();
    } else {
      setIsActive(true);
      await ensureAudioContext();
      if (audioRef.current) {
        audioRef.current.src = SILENCE_WAV;
        audioRef.current.play().catch(() => {});
      }
      recognitionRef.current?.start();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* O NÚCLEO É O PRÓPRIO BOTÃO */}
      <button 
        onClick={toggleSystemPower}
        className={cn(
          "w-80 h-80 rounded-full z-50 flex items-center justify-center transition-all duration-1000 group",
          !isActive ? "opacity-40 grayscale" : "opacity-100"
        )}
      >
        <div className="relative">
          {/* Indicador de Status Iconográfico no Centro do Núcleo */}
          {!isActive ? (
            <div className="text-primary/20 font-black text-[10px] tracking-[0.5em] animate-pulse">OFFLINE</div>
          ) : isPlaying ? (
            <div className="flex gap-1 items-end h-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 20}px`, animationDuration: `${0.3 + i * 0.1}s` }} />
              ))}
            </div>
          ) : isListening ? (
            <Mic className="w-8 h-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
          ) : (
            <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
          )}

          {/* Halo de Interação */}
          {isActive && (
            <div className={cn(
              "absolute -inset-16 rounded-full border border-primary/20 transition-all duration-700",
              isListening ? "scale-110 opacity-100 animate-ping" : "scale-100 opacity-0"
            )} />
          )}
        </div>
      </button>

      {/* Legenda Flutuante */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 text-[9px] font-code tracking-[1em] text-primary/40 uppercase pointer-events-none">
        {isActive ? (isListening ? 'Sistemas Escutando...' : 'Núcleo Ativo') : 'Aguardando Despertar'}
      </div>
    </div>
  );
}
