
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, MicOff, Volume2, Radio, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(`Comando: "${text}"`);
        setIsListening(false);
        handleProcessVoice(text);
      };

      recognition.onerror = (event: any) => {
        setError(`Erro: ${event.error}`);
        setIsListening(false);
        onProcessingChange(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Reconhecimento não suportado.");
    }
  }, [onProcessingChange]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('Escutando, Rodrigo meu senhor...');
      setError(null);
      setIsListening(true);
      onProcessingChange(true);
      recognitionRef.current?.start();
    }
  };

  const handleProcessVoice = async (query: string) => {
    onProcessingChange(true);
    setError(null);
    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(`Megatron: ${result.text}`);
      
      if (audioRef.current) {
        audioRef.current.src = result.audio;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => setIsPlaying(false));
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error(err);
      setTranscript("Falha na transmissão do link neural.");
      setError("Conexão interrompida.");
    } finally {
      onProcessingChange(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000 delay-300">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-4 w-64 border-primary/20 shadow-[0_0_30px_rgba(255,191,0,0.1)]">
        <div className="flex items-center gap-2 self-start">
          <Radio className={cn("w-4 h-4", isPlaying ? "text-primary animate-pulse" : "text-primary/40")} />
          <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest">Link de Voz</span>
        </div>

        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse scale-150 transition-opacity duration-500",
            (isListening || isPlaying) ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleListening}
            disabled={isPlaying}
            className={cn(
              "w-20 h-20 rounded-full border-2 transition-all relative z-10 overflow-hidden",
              isListening ? "bg-red-500/20 border-red-500 animate-pulse" : 
              isPlaying ? "bg-primary/40 border-primary scale-110" :
              "bg-primary/10 border-primary/30 hover:border-primary/60"
            )}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-red-500" />
            ) : isPlaying ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Mic className="w-8 h-8 text-primary" />
            )}
          </Button>
        </div>

        <div className="w-full text-center h-12 overflow-hidden px-2 flex flex-col justify-center">
          {error ? (
            <div className="flex items-center justify-center gap-1 text-red-500 text-[10px] font-bold">
              <AlertCircle className="w-3 h-3" /> {error}
            </div>
          ) : (
            <p className="text-[10px] font-code text-primary/70 leading-tight italic">
              {transcript || "Aguardando Rodrigo meu senhor..."}
            </p>
          )}
        </div>

        {isPlaying && (
          <div className="flex gap-0.5 h-3 items-end">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div 
                key={i} 
                className="w-1 bg-primary animate-bounce" 
                style={{ animationDuration: `${0.3 + Math.random() * 0.4}s` }} 
              />
            ))}
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
