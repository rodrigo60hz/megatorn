
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Power, Loader2, AudioLines, Zap, Terminal, Share2 } from 'lucide-react';
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
  const [clapDetected, setClapDetected] = useState(false);
  const [scriptText, setScriptText] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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
      // Falha silenciosa
    }
  }, [isPlaying, isListening]);

  const initClapDetection = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      // Sempre criar ou recriar se estiver fechado para evitar InvalidStateError
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
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudio = () => {
          if (!isSystemActiveRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for(let i = 0; i < bufferLength; i++) sum += dataArray[i];
          const average = sum / bufferLength;

          if (average > 90) { 
            const now = Date.now();
            if (now - lastClapTimeRef.current > 150) { 
              if (now - lastClapTimeRef.current < 800) {
                clapCountRef.current++;
              } else {
                clapCountRef.current = 1;
              }
              lastClapTimeRef.current = now;

              if (clapCountRef.current >= 2) {
                setClapDetected(true);
                setTimeout(() => setClapDetected(false), 500);
                clapCountRef.current = 0;
                if (!isListening && !isPlaying && !isProcessingRef.current) {
                  startRecognition();
                }
              }
            }
          }
          animationFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      }
    } catch (err) {
      console.warn("DRIVER_AUDIO_BUSY");
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
          setTranscript(`COMANDO: "${text.toUpperCase()}"`);
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
          setTimeout(startRecognition, 400);
        }
      };
      audioRef.current = audio;
    }

    return () => {
      recognitionRef.current?.abort();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
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
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setTranscript('SISTEMA_OFFLINE');
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      setTranscript('MEGATRON_ONLINE (2 PALMAS)');
      
      // Forçar inicialização para desbloquear áudio no navegador
      await initClapDetection();
      
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
    setTranscript('PROCESSANDO_ORDEM...');

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      setIsTransmitting(false);
      
      if (result.audio && audioRef.current) {
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
            "absolute inset-0 rounded-full bg-primary/30 blur-[100px] scale-150 transition-all duration-1000",
            isActive ? "opacity-100" : "opacity-0",
            isTransmitting && "bg-secondary/50 animate-pulse"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-60 h-60 rounded-full border-[8px] transition-all duration-700 relative z-10 flex items-center justify-center shadow-2xl",
              !isActive ? "bg-black/95 border-primary/20" :
              isPlaying ? "bg-primary/50 border-primary shadow-[0_0_150px_#FFBF00] scale-110" :
              isListening ? "bg-primary/20 border-primary animate-pulse scale-105" :
              "bg-primary/10 border-primary/40"
            )}
          >
            {!isActive ? (
              <div className="flex flex-col items-center gap-3">
                <Power className="w-20 h-20 text-primary/30" />
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">INICIAR_SISTEMA</span>
              </div>
            ) : isPlaying ? (
              <div className="flex gap-2 items-center justify-center h-full">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className="w-3 bg-primary rounded-full animate-bounce" 
                    style={{ 
                      height: `${70 + Math.random() * 90}px`, 
                      animationDuration: `${0.1 + i * 0.05}s`,
                      boxShadow: '0 0 25px #FFBF00'
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-28 h-28 text-primary drop-shadow-[0_0_30px_#FFBF00]" />
                <div className="absolute w-44 h-44 rounded-full border-4 border-primary/60 animate-ping" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-24 h-24 text-primary animate-spin" />
                <span className="text-[10px] font-black text-primary opacity-60 uppercase tracking-widest">AGUARDANDO_PALMAS</span>
              </div>
            )}
          </Button>
        </div>

        <div className={cn(
          "w-[600px] hud-glass rounded-3xl p-10 border-2 transition-all duration-500 flex flex-col items-center text-center",
          isTransmitting ? "border-secondary scale-105" : "border-primary/50"
        )}>
          <div className="flex justify-between w-full mb-6 opacity-60 text-[11px] font-code tracking-[0.5em] font-black">
             <div className="flex items-center gap-2">
               <Zap className={cn("w-4 h-4", isActive && "text-primary animate-pulse")} />
               MEGATRON_V12_ACTV
             </div>
             <div className="flex items-center gap-2">
               <AudioLines className={cn("w-4 h-4", isListening && "text-primary animate-bounce")} />
               UPLINK_SOBERANO
             </div>
          </div>
          
          <div className="min-h-[100px] flex items-center justify-center w-full">
            <p className={cn(
              "text-2xl font-body font-black tracking-tight drop-shadow-[0_0_15px_rgba(255,191,0,0.5)] transition-all",
              isTransmitting ? "text-secondary scale-110" : "text-primary"
            )}>
              {transcript}
            </p>
          </div>

          {isActive && (
            <form onSubmit={handleScriptSubmit} className="mt-8 w-full relative">
              <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <Input 
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="SCRIPT_VOZ_MEGATRON..."
                className="bg-black/50 border-primary/30 text-primary placeholder:text-primary/10 font-code text-xs pl-12 h-12 rounded-xl"
              />
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-primary/20 w-full flex justify-between text-[11px] font-code text-primary/40 uppercase tracking-[0.4em] font-black">
            <span>SOBERANO_RODRIGO</span>
            <span className={cn(isTransmitting && "text-secondary animate-pulse")}>
              {isTransmitting ? 'TRANSMITINDO_AO_SOBERANO' : 'SINAL_LIMPO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
