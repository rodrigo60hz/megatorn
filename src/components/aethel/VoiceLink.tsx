"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Radio, Loader2, Power, Volume2, ShieldCheck, Zap, LockOpen } from 'lucide-react';
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
  const [transcript, setTranscript] = useState('SISTEMA_EM_ESPERA');
  const [hasPermission, setHasPermission] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSystemActiveRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialização do Reconhecimento e Áudio
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
        if (isSystemActiveRef.current && !isPlaying) attemptRestart();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isSystemActiveRef.current && !isPlaying) attemptRestart();
      };

      recognitionRef.current = recognition;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.onended = () => {
        setIsPlaying(false);
        if (isSystemActiveRef.current) {
          attemptRestart();
        }
      };
      audioRef.current = audio;
    }

    return () => {
      recognitionRef.current?.abort();
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, [isPlaying]);

  const attemptRestart = () => {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    if (isSystemActiveRef.current && !isPlaying && !isListening) {
      restartTimeoutRef.current = setTimeout(() => {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          // Já está rodando ou erro silencioso
        }
      }, 100);
    }
  };

  const toggleSystemPower = () => {
    if (isActive) {
      setIsActive(false);
      isSystemActiveRef.current = false;
      recognitionRef.current?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setIsPlaying(false);
      setTranscript('MEGATRON_DESATIVADO');
    } else {
      setIsActive(true);
      setHasPermission(true);
      isSystemActiveRef.current = true;
      setTranscript('LINK_NEURAL_ONLINE');
      
      // DESBLOQUEIO AGRESSIVO DE ÁUDIO - Grant Permission
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
        }).catch(() => {});
      }
      
      setTimeout(() => attemptRestart(), 500);
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
          playPromise.catch(() => {
            setIsPlaying(false);
            attemptRestart();
          });
        }
      } else {
        // Se não houver áudio devido a erro de cota, apenas mostramos o texto e voltamos a ouvir
        attemptRestart();
      }
    } catch (err: any) {
      attemptRestart();
    } finally {
      onProcessingChange(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-5 w-80 border-primary shadow-[0_0_80px_rgba(255,191,0,0.4)] bg-background/90">
        <div className="flex items-center justify-between w-full border-b border-primary/30 pb-3">
          <div className="flex items-center gap-2">
            <Zap className={cn("w-3 h-3 transition-all", isActive ? "text-primary animate-pulse" : "text-primary/20")} />
            <span className="text-[11px] font-headline font-bold text-primary tracking-[0.3em] uppercase">
              {isActive ? "PERMISSÃO_CONCEDIDA" : "NÚCLEO_BLOQUEADO"}
            </span>
          </div>
          <div className="flex gap-3">
             <LockOpen className={cn("w-4 h-4 transition-all", hasPermission ? "text-primary opacity-100" : "text-primary/20")} />
             <Volume2 className={cn("w-4 h-4", isPlaying ? "text-primary animate-pulse scale-125" : "text-primary/20")} />
          </div>
        </div>

        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/40 blur-[50px] scale-150 transition-opacity duration-700",
            isActive ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-36 h-36 rounded-full border-[4px] transition-all duration-500 relative z-10 flex items-center justify-center",
              !isActive ? "bg-black/90 border-primary/20 hover:border-primary/60" :
              isPlaying ? "bg-primary/50 border-primary shadow-[0_0_100px_#FFBF00] scale-105" :
              isListening ? "bg-primary/25 border-primary animate-pulse scale-110" :
              "bg-primary/10 border-primary/40"
            )}
          >
            {!isActive ? (
              <div className="flex flex-col items-center gap-2">
                <Power className="w-16 h-16 text-primary/40" />
                <span className="text-[8px] font-black text-primary animate-pulse">DAR PERMISSÃO</span>
              </div>
            ) : isPlaying ? (
              <div className="flex gap-1.5 items-center justify-center h-full">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className="w-2.5 bg-primary rounded-full animate-bounce" 
                    style={{ 
                      height: `${40 + Math.random() * 60}px`, 
                      animationDuration: `${0.12 + i * 0.04}s`,
                      boxShadow: '0 0 15px #FFBF00'
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-16 h-16 text-primary drop-shadow-[0_0_20px_#FFBF00]" />
                <div className="absolute w-28 h-28 rounded-full border-2 border-primary/60 animate-ping" />
              </div>
            ) : (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
          </Button>
        </div>

        <div className="w-full bg-black/70 rounded-xl p-5 border border-primary/50 min-h-[100px] flex flex-col justify-center text-center relative overflow-hidden shadow-2xl">
          {isActive && <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />}
          
          <p className="text-[14px] font-body text-primary leading-tight font-black tracking-tight drop-shadow-[0_0_5px_rgba(255,191,0,0.5)]">
            {isPlaying && <span className="text-[9px] opacity-70 block mb-1 uppercase tracking-[0.4em] animate-pulse">Voz de José Santa Cruz...</span>}
            {transcript}
          </p>

          {isListening && !isPlaying && (
            <div className="absolute bottom-2 right-4 flex items-center gap-2">
              <span className="text-[8px] font-code text-primary/80 font-black tracking-widest">OUVINDO...</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            </div>
          )}
        </div>

        <div className="flex justify-between w-full text-[9px] font-code text-primary/50 uppercase tracking-[0.4em] font-black">
          <span>ALMA_DE_SANTA_CRUZ</span>
          <span className="flex items-center gap-2">LINK_INFINITO <div className="w-1 h-1 rounded-full bg-primary animate-pulse" /></span>
        </div>
      </div>
    </div>
  );
}
