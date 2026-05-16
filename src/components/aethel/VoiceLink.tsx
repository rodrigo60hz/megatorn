"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VoiceLink({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startVoiceInteraction = async () => {
    const query = prompt("Fale com Megatron (Digite seu comando para resposta em áudio):");
    if (!query) return;

    setIsListening(true);
    onProcessingChange(true);
    setTranscript(`Escutando: "${query}"`);

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(`Megatron: ${result.text}`);
      
      if (audioRef.current) {
        audioRef.current.src = result.audio;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
      setTranscript("Falha na transmissão do link de voz.");
    } finally {
      setIsListening(false);
      onProcessingChange(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000 delay-300">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-4 w-64 border-secondary/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-2 self-start">
          <Radio className="w-4 h-4 text-secondary" />
          <span className="text-[10px] font-headline font-bold text-secondary uppercase tracking-widest">Link de Voz</span>
        </div>

        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full bg-secondary/20 blur-xl animate-pulse scale-150",
            (isListening || isPlaying) ? "opacity-100" : "opacity-0"
          )} />
          <Button 
            onClick={startVoiceInteraction}
            disabled={isListening || isPlaying}
            className={cn(
              "w-20 h-20 rounded-full border-2 transition-all relative z-10",
              isListening ? "bg-red-500/20 border-red-500 animate-pulse" : 
              isPlaying ? "bg-secondary/40 border-secondary scale-110" :
              "bg-secondary/20 border-secondary/40 hover:bg-secondary/30"
            )}
          >
            {isListening ? <MicOff className="w-8 h-8 text-red-500" /> : <Mic className="w-8 h-8 text-secondary" />}
          </Button>
        </div>

        <div className="w-full text-center h-12 overflow-hidden">
          <p className="text-[10px] font-code text-secondary/70 leading-tight">
            {transcript || "Aguardando comando de voz..."}
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 h-4 items-end">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div 
                  key={i} 
                  className="w-1 bg-secondary animate-bounce" 
                  style={{ animationDuration: `${0.5 + Math.random()}s` }} 
                />
              ))}
            </div>
            <Volume2 className="w-4 h-4 text-secondary animate-pulse" />
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
