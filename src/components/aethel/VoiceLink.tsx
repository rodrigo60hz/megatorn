"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, MicOff, Volume2, Radio, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Tipagem para a Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceLink({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(`Comando detectado: "${text}"`);
        setIsListening(false);
        handleProcessVoice(text);
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento:', event.error);
        setError(`Erro: ${event.error}`);
        setIsListening(false);
        onProcessingChange(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Reconhecimento de voz não suportado neste terminal.");
    }
  }, [onProcessingChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('Escutando comandos...');
      setError(null);
      setIsListening(true);
      onProcessingChange(true);
      recognitionRef.current?.start();
    }
  };

  const handleProcessVoice = async (query: string) => {
    onProcessingChange(true);
    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(`Megatron: ${result.text}`);
      
      if (audioRef.current) {
        audioRef.current.src = result.audio;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
      setTranscript("Falha na transmissão do link neural.");
    } finally {
      onProcessingChange(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000 delay-300">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-4 w-64 border-primary/20 shadow-[0_0_30px_rgba(255,191,0,0.1)]">
        <div className="flex items-center gap-2 self-start">
          <Radio className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest">Link de Voz</span>
        </div>

        <div className="relative">
          {/* Pulsing Aura when Active */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse scale-150 transition-opacity duration-500",
            (isListening || isPlaying) ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleListening}
            disabled={isPlaying}
            className={cn(
              "w-20 h-20 rounded-full border-2 transition-all relative z-10 overflow-hidden",
              isListening ? "bg-red-500/20 border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]" : 
              isPlaying ? "bg-primary/40 border-primary scale-110 shadow-[0_0_25px_#FFBF00]" :
              "bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/60"
            )}
          >
            {isListening ? (
              <div className="flex flex-col items-center">
                <MicOff className="w-8 h-8 text-red-500 mb-1" />
                <span className="text-[8px] font-bold text-red-500">LIVE</span>
              </div>
            ) : isPlaying ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-primary" />
            )}
          </Button>
        </div>

        <div className="w-full text-center h-12 overflow-hidden px-2">
          <p className={cn(
            "text-[10px] font-code leading-tight transition-colors duration-300",
            error ? "text-red-500" : "text-primary/70"
          )}>
            {error || transcript || "Aguardando comando de voz..."}
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 h-4 items-end">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className="w-1 bg-primary animate-bounce shadow-[0_0_5px_#FFBF00]" 
                  style={{ animationDuration: `${0.4 + Math.random() * 0.4}s` }} 
                />
              ))}
            </div>
            <Volume2 className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}

        <audio 
          ref={audioRef} 
          onEnded={() => setIsPlaying(false)} 
          className="hidden" 
        />
      </div>
    </div>
  );
}
