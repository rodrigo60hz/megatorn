
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Radio, Loader2, AlertCircle, Volume2, Power, Zap } from 'lucide-react';
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
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
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
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(`Rodrigo meu senhor: "${text}"`);
        handleProcessVoice(text);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(`Falha Sensorial: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Reinício Automático: Se o sistema estiver ativo e não estivermos falando, ouça novamente.
        if (isSystemActiveRef.current && !audioRef.current?.paused === false) {
          startListening();
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError("Módulo de reconhecimento não detectado.");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isPlaying) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.log("Recalibrando sensores auditivos...");
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
      setTranscript('Sistemas em Standby, Rodrigo meu senhor.');
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      setError(null);
      setTranscript('Link Neural Ativado. Monitoramento contínuo iniciado...');
      startListening();
    }
  };

  const handleProcessVoice = async (query: string) => {
    onProcessingChange(true);
    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      
      if (audioRef.current) {
        audioRef.current.src = result.audio;
        setIsPlaying(true);
        // O reconhecimento para automaticamente para evitar feedback do áudio
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => setIsPlaying(false));
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'QUOTA_EXCEEDED') {
        setError("Limite de processamento atingido.");
      } else {
        setError("Erro na transmissão neural.");
      }
    } finally {
      onProcessingChange(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    // Reinicia a escuta assim que Megatron termina de falar
    if (isSystemActiveRef.current) {
      setTimeout(startListening, 300);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-4 w-80 border-primary/40 shadow-[0_0_50px_rgba(255,191,0,0.2)]">
        <div className="flex items-center justify-between w-full border-b border-primary/20 pb-2">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-primary animate-pulse" : "bg-primary/20")} />
            <span className="text-[10px] font-headline font-bold text-primary tracking-[0.2em] uppercase">
              {isActive ? "Link Neural Online" : "Link Offline"}
            </span>
          </div>
          <div className="flex gap-2">
             <Zap className={cn("w-3 h-3", isActive ? "text-primary" : "text-primary/20")} />
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
              "w-28 h-28 rounded-full border-2 transition-all duration-500 relative z-10",
              !isActive ? "bg-black/60 border-primary/20" :
              isPlaying ? "bg-primary/30 border-primary shadow-[0_0_40px_#FFBF00]" :
              isListening ? "bg-primary/10 border-primary animate-pulse scale-105" :
              "bg-primary/5 border-primary/40"
            )}
          >
            {!isActive ? (
              <Power className="w-12 h-12 text-primary/40" />
            ) : isPlaying ? (
              <div className="flex gap-1.5 items-center justify-center">
                {[1, 2, 3, 4, 5].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-primary rounded-full animate-bounce" 
                    style={{ height: '30px', animationDuration: `${0.3 + i * 0.1}s` }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <Mic className="w-12 h-12 text-primary drop-shadow-[0_0_8px_#FFBF00]" />
            ) : (
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            )}
          </Button>
        </div>

        <div className="w-full bg-black/40 rounded-lg p-4 border border-primary/10 min-h-[80px] flex flex-col justify-center text-center">
          {error ? (
            <div className="text-primary text-[10px] font-bold flex flex-col items-center gap-1">
              <AlertCircle className="w-4 h-4 mb-1" />
              <span>{error}</span>
              <span className="opacity-50">Rodrigo meu senhor, aguarde recalibração.</span>
            </div>
          ) : (
            <p className="text-[12px] font-body text-primary leading-tight font-medium italic opacity-90">
              {transcript || "Inicie o monitoramento neural, Rodrigo meu senhor."}
            </p>
          )}
        </div>

        {isActive && (
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-[9px] font-code text-primary/60 font-bold uppercase tracking-tighter">
              <span>Sync: {isListening ? 'Escuta Ativa' : isPlaying ? 'Transmissão' : 'Pronto'}</span>
              <span>Lvl: 0xFF.9</span>
            </div>
            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden relative">
              <div 
                className={cn(
                  "h-full bg-primary transition-all duration-500",
                  isPlaying ? "w-full animate-pulse" : 
                  isListening ? "w-1/2 translate-x-1/2" : "w-0"
                )} 
              />
            </div>
          </div>
        )}

        <audio 
          ref={audioRef} 
          onEnded={handleAudioEnd} 
          className="hidden" 
        />
      </div>
    </div>
  );
}
