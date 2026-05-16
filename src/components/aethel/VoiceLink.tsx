
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, MicOff, Radio, Loader2, AlertCircle, Volume2, Power } from 'lucide-react';
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
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(`Rodrigo meu senhor: "${text}"`);
        setIsListening(false);
        handleProcessVoice(text);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(`Erro Neural: ${event.error}`);
        }
        setIsListening(false);
        // Se houver erro de silêncio e o link deve estar ativo, tentamos reiniciar
        if (event.error === 'no-speech' && shouldListenRef.current && !isPlaying) {
          startRecognitionSafe();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Reinicia automaticamente se o link estiver ativo e não estivermos tocando áudio
        if (shouldListenRef.current && !isPlaying && !isListening) {
          startRecognitionSafe();
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError("Reconhecimento não suportado.");
    }
  }, [isPlaying]);

  const startRecognitionSafe = () => {
    try {
      if (recognitionRef.current && !isListening && !isPlaying) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (e) {
      console.log("Tentativa de reinicialização do mic...");
    }
  };

  const toggleSystemPower = () => {
    if (isActive) {
      setIsActive(false);
      shouldListenRef.current = false;
      recognitionRef.current?.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setTranscript('Sistemas Megatron em Standby.');
    } else {
      setIsActive(true);
      shouldListenRef.current = true;
      setError(null);
      setTranscript('Link Neural Ativado. Aguardando ordens, Rodrigo meu senhor...');
      startRecognitionSafe();
    }
  };

  const handleProcessVoice = async (query: string) => {
    onProcessingChange(true);
    setError(null);
    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      
      if (audioRef.current) {
        audioRef.current.src = result.audio;
        setIsPlaying(true);
        // Paramos o mic enquanto falamos para evitar eco
        recognitionRef.current?.stop();
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => setIsPlaying(false));
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'QUOTA_EXCEEDED') {
        setError("Limite de cota atingido.");
        setTranscript("Sistema sobrecarregado, Rodrigo meu senhor.");
      } else {
        setTranscript("Falha na transmissão do link neural.");
        setError("Conexão interrompida.");
      }
      // Se der erro, tenta voltar a ouvir se o sistema ainda estiver ativo
      if (shouldListenRef.current) {
        setTimeout(startRecognitionSafe, 2000);
      }
    } finally {
      onProcessingChange(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    if (shouldListenRef.current) {
      // Pequeno delay para garantir que o áudio terminou mesmo antes de abrir o mic
      setTimeout(startRecognitionSafe, 500);
    }
  };

  return (
    <div className="fixed bottom-24 left-8 z-50 animate-in slide-in-from-bottom duration-1000 delay-300">
      <div className="hud-glass p-6 rounded-2xl flex flex-col items-center gap-4 w-72 border-primary/20 shadow-[0_0_40px_rgba(255,191,0,0.15)]">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Radio className={cn("w-4 h-4", isActive ? "text-primary animate-pulse" : "text-primary/40")} />
            <span className="text-[10px] font-headline font-bold text-primary uppercase tracking-widest">
              {isActive ? "Link Neural Ativo" : "Link Neural Offline"}
            </span>
          </div>
          {isPlaying && <Volume2 className="w-3 h-3 text-primary animate-bounce" />}
        </div>

        <div className="relative">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse scale-150 transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-24 h-24 rounded-full border-2 transition-all relative z-10 overflow-hidden",
              !isActive ? "bg-black/40 border-primary/20 hover:border-primary/60" :
              isPlaying ? "bg-primary/40 border-primary scale-110 shadow-[0_0_30px_#FFBF00]" :
              isListening ? "bg-primary/20 border-primary animate-pulse" :
              "bg-primary/10 border-primary/60"
            )}
          >
            {!isActive ? (
              <Power className="w-10 h-10 text-primary/40" />
            ) : isPlaying ? (
              <div className="flex gap-1 items-end h-8">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-primary animate-bounce rounded-full" 
                    style={{ height: `${40 + Math.random() * 60}%`, animationDuration: `${0.4 + i * 0.1}s` }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <Mic className="w-10 h-10 text-primary animate-pulse" />
            ) : (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            )}
          </Button>
        </div>

        <div className="w-full text-center min-h-[60px] flex flex-col justify-center bg-black/20 rounded-lg p-3 border border-primary/5">
          {error ? (
            <div className="flex flex-col items-center justify-center gap-1 text-primary text-[10px] font-bold">
              <div className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</div>
              <span className="opacity-50">Rodrigo meu senhor, aguarde reinicialização.</span>
            </div>
          ) : (
            <p className="text-[11px] font-body text-primary/90 leading-tight italic">
              {transcript || "Ative o Link Neural, Rodrigo meu senhor."}
            </p>
          )}
        </div>

        {isActive && (
          <div className="w-full flex flex-col gap-1">
            <div className="flex justify-between text-[8px] font-code opacity-50 px-1">
              <span>ESTADO: {isPlaying ? 'TRANSMITINDO' : isListening ? 'MONITORANDO' : 'PROCESSANDO'}</span>
              <span>SYNC_OK</span>
            </div>
            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-primary transition-all duration-300",
                  isPlaying ? "animate-[scanline_2s_linear_infinite] w-full" : 
                  isListening ? "w-1/3 animate-pulse" : "w-2/3"
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
