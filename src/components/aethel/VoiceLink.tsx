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
    // In a real browser implementation, we'd use Web Speech API for STT
    // Since we're bridging to the pre-built flow, we'll simulate the "listening" part 
    // and use a demo prompt or just wait for user text if it were integrated better.
    // For this UI demo, clicking mic will prompt for a manual command to feed into the voice flow.
    
    const query = prompt("Speak to Aethel (Type your command for audio response):");
    if (!query) return;

    setIsListening(true);
    onProcessingChange(true);
    setTranscript(`Listening: "${query}"`);

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(`Aethel: ${result.text}`);
      
      if (audioRef.current) {
        audioRef.current.src = result.audio;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
      setTranscript("Voice link transmission failed.");
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
          <span className="text-[10px] font-headline font-bold text-secondary uppercase tracking-widest">Voice Link</span>
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
            {transcript || "Standby for voice command..."}
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