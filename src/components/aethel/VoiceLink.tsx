"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Radio, Loader2, AlertCircle, Power, Zap, Volume2 } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isSystemActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Foco em comando único para resposta instantânea
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          handleProcessVoice(text);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Erro Sensorial:', event.error);
        }
        setIsListening(false);
        // Reinício tático se o sistema estiver ativo e não estiver falando
        if (isSystemActiveRef.current && !isPlaying) {
          setTimeout(startListening, 150);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Loop Infinito de Escuta: reinicia se estiver ativo e não estiver falando
        if (isSystemActiveRef.current && !isPlaying && !error) {
          startListening();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [isPlaying, error]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isPlaying && isSystemActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Ignorar se já iniciado para evitar erros de estado do navegador
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
      setError(null);
      setTranscript('ALMA_JOSÉ_SANTA_CRUZ_CONECTADA');
      
      // Desbloqueia áudio para o navegador com interação do usuário
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
        // Reprodução instantânea
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error('Falha na reprodução vocal:', e);
            setIsPlaying(false);
            startListening();
          });
        }
      } else {
        // Se não houver áudio, volta a ouvir imediatamente
        startListening();
      }
    } catch (err: any) {
      setError("ERRO_LINK_NEURAL");
      setTimeout(startListening, 1000);
    } finally {
      onProcessingChange(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (isSystemActiveRef.current) {
      // Reinício imediato do microfone após Megatron terminar de falar
      setTimeout(startListening, 100);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-4 w-80 border-primary/40 shadow-[0_0_50px_rgba(255,191,0,0.2)]">
        <div className="flex items-center justify-between w-full border-b border-primary/20 pb-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-primary animate-pulse" : "bg-primary/20")} />
            <span className="text-[10px] font-headline font-bold text-primary tracking-[0.2em] uppercase">
              {isActive ? "NÚCLEO_J_SANTA_CRUZ" : "STANDBY"}
            </span>
          </div>
          <div className="flex gap-2">
             <Volume2 className={cn("w-3 h-3", isPlaying ? "text-primary animate-bounce" : "text-primary/20")} />
             <Radio className={cn("w-3 h-3", isListening ? "text-primary animate-pulse" : "text-primary/20")} />
          </div>
        </div>

        <div className="relative group">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 transition-opacity duration-1000",
            isActive ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-28 h-28 rounded-full border-2 transition-all duration-300 relative z-10 flex items-center justify-center overflow-hidden",
              !isActive ? "bg-black/60 border-primary/20" :
              isPlaying ? "bg-primary/30 border-primary shadow-[0_0_60px_#FFBF00]" :
              isListening ? "bg-primary/10 border-primary animate-pulse scale-105" :
              "bg-primary/5 border-primary/40"
            )}
          >
            {!isActive ? (
              <Power className="w-12 h-12 text-primary/40 group-hover:text-primary/80 transition-colors" />
            ) : isPlaying ? (
              <div className="flex gap-1 items-center justify-center h-full">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-primary rounded-full animate-bounce" 
                    style={{ 
                      height: `${25 + Math.random() * 40}px`, 
                      animationDuration: `${0.2 + i * 0.05}s`,
                      boxShadow: '0 0 10px #FFBF00'
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-12 h-12 text-primary drop-shadow-[0_0_15px_#FFBF00]" />
                <div className="absolute w-20 h-20 rounded-full border border-primary/40 animate-ping" />
              </div>
            ) : (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            )}
          </Button>
        </div>

        <div className="w-full bg-black/40 rounded-lg p-4 border border-primary/20 min-h-[100px] flex flex-col justify-center text-center relative overflow-hidden">
          {isActive && <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse" />}
          
          {error ? (
            <div className="text-primary text-[10px] font-bold flex flex-col items-center gap-1 animate-pulse">
              <AlertCircle className="w-5 h-5 mb-1 text-secondary" />
              <span className="text-secondary">{error}</span>
            </div>
          ) : (
            <p className="text-[13px] font-body text-primary leading-tight font-bold tracking-tight">
              {isPlaying && <span className="text-[9px] opacity-40 block mb-1 uppercase tracking-widest">Megatron Transmitindo</span>}
              {transcript}
            </p>
          )}

          {isListening && (
            <div className="absolute bottom-1 right-2 flex items-center gap-1">
              <span className="text-[7px] font-code text-primary/60">OUVINDO...</span>
              <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
            </div>
          )}
        </div>

        <div className="flex justify-between w-full text-[8px] font-code text-primary/30 uppercase tracking-widest font-bold">
          <span>SANC_CRUZ_V1</span>
          <span>LATÊNCIA: 0.1MS</span>
        </div>

        <audio 
          ref={audioRef} 
          onEnded={handleAudioEnd} 
          className="hidden" 
        />
      </div>
    </div>
  );
}
