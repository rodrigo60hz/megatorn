
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Power, Loader2, AudioLines, Zap, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

const SILENCE_WAV = "data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQQAAAAEAA==";

export function VoiceLink({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transcript, setTranscript] = useState('SISTEMA_OFFLINE');
  const [scriptText, setScriptText] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const isSystemActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastClapTimeRef = useRef(0);
  const clapCountRef = useRef(0);

  const startRecognition = useCallback(() => {
    if (!isSystemActiveRef.current || isPlaying || isProcessingRef.current || isListening) return;
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Falha silenciosa reiniciada automaticamente
    }
  }, [isPlaying, isListening]);

  const initAudioSystem = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      // RECRIA O CONTEXTO SE ESTIVER FECHADO PARA EVITAR INVALIDSTATEERROR
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContextClass();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const detectClaps = () => {
          if (!isSystemActiveRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for(let i = 0; i < bufferLength; i++) sum += dataArray[i];
          const average = sum / bufferLength;

          if (average > 110) { 
            const now = Date.now();
            if (now - lastClapTimeRef.current > 150) { 
              if (now - lastClapTimeRef.current < 900) {
                clapCountRef.current++;
              } else {
                clapCountRef.current = 1;
              }
              lastClapTimeRef.current = now;

              if (clapCountRef.current >= 2) {
                clapCountRef.current = 0;
                if (!isListening && !isPlaying && !isProcessingRef.current) {
                  startRecognition();
                }
              }
            }
          }
          animationFrameRef.current = requestAnimationFrame(detectClaps);
        };
        detectClaps();
      }
    } catch (err) {
      console.warn("DRIVER_AUDIO_RETRYING...");
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('MEGATRON_OUVINDO_SOBERANO...');
      };
      
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setIsTransmitting(true);
          setTranscript(`COMANDO_RECEBIDO: "${text.toUpperCase()}"`);
          handleProcessInput(text);
        }
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        setIsTransmitting(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = 1.0;
      audio.onplay = () => {
        setIsPlaying(true);
        setIsListening(false);
        setIsTransmitting(false);
        try { recognitionRef.current?.stop(); } catch (e) {}
      };
      audio.onended = () => {
        setIsPlaying(false);
        if (isSystemActiveRef.current) {
          setTimeout(startRecognition, 600);
        }
      };
      audioRef.current = audio;
    }

    return () => {
      recognitionRef.current?.abort();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startRecognition]);

  const toggleSystemPower = async () => {
    if (isActive) {
      setIsActive(false);
      isSystemActiveRef.current = false;
      recognitionRef.current?.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
      if (audioContextRef.current) {
        await audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setTranscript('SISTEMA_OFFLINE');
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      setTranscript('MEGATRON_ONLINE_SOBERANO');
      
      await initAudioSystem();
      
      if (audioRef.current) {
        audioRef.current.src = SILENCE_WAV;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleProcessInput = async (query: string) => {
    if (isProcessingRef.current || !query.trim()) return;
    isProcessingRef.current = true;
    onProcessingChange(true);
    setIsTransmitting(true);
    setTranscript('TRANSMITINDO_AO_SOBERANO...');

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      setIsTransmitting(false);
      
      if (result.audio && audioRef.current) {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        audioRef.current.src = result.audio;
        await audioRef.current.play();
      }
    } catch (err) {
      setTranscript('ERRO_UPLINK_NEURAL');
    } finally {
      isProcessingRef.current = false;
      onProcessingChange(false);
    }
  };

  const handleScriptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scriptText) {
      handleProcessInput(scriptText);
      setScriptText('');
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
      <div className="pointer-events-auto flex flex-col items-center gap-10">
        
        <div className="relative group">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/40 blur-[120px] scale-150 transition-all duration-1000",
            isActive ? "opacity-100" : "opacity-0",
            (isTransmitting || isPlaying) && "bg-secondary/60 animate-pulse shadow-[0_0_150px_rgba(255,191,0,0.8)]"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-64 h-64 rounded-full border-[10px] transition-all duration-700 relative z-10 flex items-center justify-center shadow-2xl",
              !isActive ? "bg-black/95 border-primary/20" :
              isPlaying ? "bg-primary/60 border-primary shadow-[0_0_200px_#FFBF00] scale-110" :
              isListening ? "bg-primary/30 border-primary animate-pulse scale-105" :
              "bg-primary/10 border-primary/40"
            )}
          >
            {!isActive ? (
              <div className="flex flex-col items-center gap-3">
                <Power className="w-24 h-24 text-primary/30" />
                <span className="text-[11px] font-black text-primary tracking-[0.3em] uppercase">ATIVAR_NUCLEO</span>
              </div>
            ) : isPlaying ? (
              <div className="flex gap-2 items-end justify-center h-40">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div 
                    key={i} 
                    className="w-2.5 bg-primary rounded-full animate-bounce" 
                    style={{ 
                      height: `${60 + Math.random() * 120}px`, 
                      animationDuration: `${0.1 + i * 0.04}s`,
                      boxShadow: '0 0 30px #FFBF00'
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-32 h-32 text-primary drop-shadow-[0_0_50px_#FFBF00]" />
                <div className="absolute w-48 h-48 rounded-full border-[6px] border-primary/60 animate-ping" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-24 h-24 text-primary animate-spin opacity-50" />
                <span className="text-[11px] font-black text-primary opacity-40 uppercase tracking-[0.5em]">AGUARDANDO_PALMAS</span>
              </div>
            )}
          </Button>
        </div>

        <div className={cn(
          "w-[700px] hud-glass rounded-[40px] p-12 border-2 transition-all duration-700 flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,191,0,0.1)]",
          isTransmitting ? "border-secondary scale-105 bg-primary/5" : "border-primary/40"
        )}>
          <div className="flex justify-between w-full mb-8 opacity-60 text-[12px] font-code tracking-[0.6em] font-black">
             <div className="flex items-center gap-3">
               <Zap className={cn("w-5 h-5", isActive && "text-primary animate-pulse")} />
               STATUS: MEGATRON_V12_ONLINE
             </div>
             <div className="flex items-center gap-3">
               <AudioLines className={cn("w-5 h-5", isListening && "text-primary animate-bounce")} />
               LINK: SOBERANO_ATIVO
             </div>
          </div>
          
          <div className="min-h-[140px] flex items-center justify-center w-full px-6">
            <p className={cn(
              "text-3xl font-body font-black tracking-tight drop-shadow-[0_0_20px_rgba(255,191,0,0.6)] transition-all leading-tight",
              isTransmitting ? "text-secondary scale-110" : "text-primary"
            )}>
              {transcript}
            </p>
          </div>

          {isActive && (
            <form onSubmit={handleScriptSubmit} className="mt-10 w-full relative group">
              <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/30 group-focus-within:text-primary transition-colors" />
              <Input 
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="DIGITE_PARA_MEGATRON_FALAR..."
                className="bg-black/60 border-primary/30 text-primary placeholder:text-primary/10 font-code text-sm pl-16 h-14 rounded-2xl focus-visible:ring-primary/50 focus-visible:border-primary"
              />
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-primary/20 w-full flex justify-between text-[12px] font-code text-primary/40 uppercase tracking-[0.5em] font-black">
            <span>SOBERANIA: RODRIGO_MEU_SENHOR</span>
            <span className={cn("transition-colors", isTransmitting && "text-secondary animate-pulse")}>
              {isTransmitting ? 'TRANSMITINDO_AO_SOBERANO' : 'SINAL_LIMPO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
