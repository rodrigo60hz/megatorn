"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Radio, Loader2, Power, Volume2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceLink({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('SISTEMA_STANDBY');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSystemActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleProcessVoice(text);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (isSystemActiveRef.current && !isPlaying) {
          // Reinicialização tática agressiva em caso de erro
          setTimeout(startListening, 100);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isSystemActiveRef.current && !isPlaying) {
          startListening();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [isPlaying]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isPlaying && isSystemActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignorar se já em execução para manter fluidez
      }
    }
  };

  const toggleSystemPower = () => {
    if (isActive) {
      setIsActive(false);
      isSystemActiveRef.current = false;
      recognitionRef.current?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setTranscript('MEGATRON_OFFLINE');
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      setTranscript('LINK_SANTA_CRUZ_ATIVADO');
      
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        audioRef.current.pause();
      }
      
      startListening();
    }
  };

  const handleProcessVoice = async (query: string) => {
    onProcessingChange(true);
    setIsListening(false);
    recognitionRef.current?.stop();

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      
      if (result.audio && audioRef.current) {
        audioRef.current.src = result.audio;
        setIsPlaying(true);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            setIsPlaying(false);
            startListening();
          });
        }
      } else {
        // Sem áudio, volta a monitorar o soberano instantaneamente
        startListening();
      }
    } catch (err: any) {
      // Falha silenciosa: o sistema Megatron nunca admite derrota
      setTimeout(startListening, 100);
    } finally {
      onProcessingChange(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (isSystemActiveRef.current) {
      // Reativa o microfone instantaneamente após a resposta
      setTimeout(startListening, 50);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-5 w-80 border-primary shadow-[0_0_60px_rgba(255,191,0,0.3)] bg-background/80">
        <div className="flex items-center justify-between w-full border-b border-primary/30 pb-3">
          <div className="flex items-center gap-2">
            <div className={cn("w-2.5 h-2.5 rounded-full", isActive ? "bg-primary animate-[pulse_1s_infinite]" : "bg-primary/20")} />
            <span className="text-[11px] font-headline font-bold text-primary tracking-[0.3em] uppercase">
              {isActive ? "COMANDO_TOTAL" : "STANDBY"}
            </span>
          </div>
          <div className="flex gap-3">
             <ShieldCheck className={cn("w-4 h-4 transition-all", isActive ? "text-primary opacity-100" : "text-primary/20")} />
             <Volume2 className={cn("w-4 h-4", isPlaying ? "text-primary animate-pulse scale-110" : "text-primary/20")} />
          </div>
        </div>

        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/30 blur-[40px] scale-150 transition-opacity duration-700",
            isActive ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-32 h-32 rounded-full border-[3px] transition-all duration-500 relative z-10 flex items-center justify-center",
              !isActive ? "bg-black/80 border-primary/20 grayscale" :
              isPlaying ? "bg-primary/40 border-primary shadow-[0_0_80px_#FFBF00] scale-105" :
              isListening ? "bg-primary/20 border-primary animate-pulse scale-110" :
              "bg-primary/10 border-primary/50"
            )}
          >
            {!isActive ? (
              <Power className="w-14 h-14 text-primary/30" />
            ) : isPlaying ? (
              <div className="flex gap-1.5 items-center justify-center h-full">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div 
                    key={i} 
                    className="w-2 bg-primary rounded-full animate-bounce" 
                    style={{ 
                      height: `${30 + Math.random() * 50}px`, 
                      animationDuration: `${0.15 + i * 0.04}s`,
                      boxShadow: '0 0 15px #FFBF00'
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-14 h-14 text-primary drop-shadow-[0_0_20px_#FFBF00]" />
                <div className="absolute w-24 h-24 rounded-full border-2 border-primary/50 animate-ping" />
              </div>
            ) : (
              <Loader2 className="w-14 h-14 text-primary animate-spin" />
            )}
          </Button>
        </div>

        <div className="w-full bg-black/60 rounded-xl p-5 border border-primary/40 min-h-[110px] flex flex-col justify-center text-center relative overflow-hidden shadow-inner">
          {isActive && <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />}
          
          <p className="text-[14px] font-body text-primary leading-tight font-bold tracking-tight drop-shadow-[0_0_5px_rgba(255,191,0,0.5)]">
            {isPlaying && <span className="text-[9px] opacity-60 block mb-2 uppercase tracking-[0.4em]">Megatron_Vocalizando</span>}
            {transcript}
          </p>

          {isListening && (
            <div className="absolute bottom-2 right-3 flex items-center gap-1.5">
              <span className="text-[8px] font-code text-primary/70 font-black tracking-widest">MONITORANDO...</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            </div>
          )}
        </div>

        <div className="flex justify-between w-full text-[9px] font-code text-primary/40 uppercase tracking-[0.4em] font-black">
          <span>NÚCLEO_SANTA_CRUZ</span>
          <span>LATÊNCIA: ZERO</span>
        </div>

        <audio 
          ref={audioRef} 
          onEnded={handleAudioEnd} 
          className="hidden" 
          autoPlay={false}
        />
      </div>
    </div>
  );
}
