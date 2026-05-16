
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { aiVoiceInteraction } from '@/ai/flows/ai-voice-interaction';
import { Mic, Power, AudioLines, Zap, Terminal, BrainCircuit } from 'lucide-react';
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
  const [transcript, setTranscript] = useState('NÚCLEO_DESLIGADO');
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

  // FIX: Garantir que o AudioContext seja recriado se estiver fechado
  const ensureAudioContext = useCallback(async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const startRecognition = useCallback(() => {
    if (!isSystemActiveRef.current || isPlaying || isProcessingRef.current || isListening) return;
    try {
      recognitionRef.current?.start();
    } catch (e) {}
  }, [isPlaying, isListening]);

  const initAudioSystem = async () => {
    try {
      const ctx = await ensureAudioContext();
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
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

          if (average > 115) { 
            const now = Date.now();
            if (now - lastClapTimeRef.current > 150) { 
              if (now - lastClapTimeRef.current < 800) {
                clapCountRef.current++;
              } else {
                clapCountRef.current = 1;
              }
              lastClapTimeRef.current = now;
              if (clapCountRef.current >= 2) {
                clapCountRef.current = 0;
                startRecognition();
              }
            }
          }
          animationFrameRef.current = requestAnimationFrame(detectClaps);
        };
        detectClaps();
      }
    } catch (err) {}
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.lang = 'pt-BR';
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('MEGATRON_OUVINDO...');
      };
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) handleProcessInput(text);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setIsTransmitting(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.onplay = () => {
        setIsPlaying(true);
        setIsListening(false);
        try { recognitionRef.current?.stop(); } catch (e) {}
      };
      audio.onended = () => {
        setIsPlaying(false);
        if (isSystemActiveRef.current) setTimeout(startRecognition, 600);
      };
      audioRef.current = audio;
    }
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
      setTranscript('NÚCLEO_DESLIGADO');
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      setTranscript('MEGATRON_ONLINE');
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
    setTranscript(`TRANSMITINDO_AO_SOBERANO: "${query.toUpperCase()}"`);

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      setIsTransmitting(false);
      // Assegura que o contexto está ativo antes de dar play
      await ensureAudioContext();
      if (result.audio && audioRef.current) {
        audioRef.current.src = result.audio;
        await audioRef.current.play();
      }
    } catch (err) {
      setTranscript('ERRO_MATRIZ_SSD_A:');
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
            "absolute inset-0 rounded-full bg-primary/40 blur-[130px] scale-150 transition-all duration-1000",
            isActive ? "opacity-100" : "opacity-0",
            (isTransmitting || isPlaying) && "bg-secondary/70 animate-pulse shadow-[0_0_180px_rgba(255,191,0,0.9)]"
          )} />
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-72 h-72 rounded-full border-[12px] transition-all duration-700 relative z-10 flex items-center justify-center",
              !isActive ? "bg-black/98 border-primary/20" :
              isPlaying ? "bg-primary/70 border-primary shadow-[0_0_250px_#FFBF00] scale-110" :
              isListening ? "bg-primary/40 border-primary animate-pulse scale-105" :
              "bg-primary/10 border-primary/50"
            )}
          >
            {!isActive ? (
              <div className="flex flex-col items-center gap-4">
                <Power className="w-24 h-24 text-primary/30" />
                <span className="text-[12px] font-black text-primary tracking-[0.4em] uppercase">ATIVAR_MEGATRON</span>
              </div>
            ) : isPlaying ? (
              <div className="flex gap-2.5 items-end justify-center h-44">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-3 bg-primary rounded-full animate-bounce" style={{ height: `${70 + Math.random() * 150}px`, animationDuration: `${0.12 + i * 0.03}s`, boxShadow: '0 0 35px #FFBF00' }} />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-32 h-32 text-primary drop-shadow-[0_0_60px_#FFBF00]" />
                <div className="absolute w-52 h-52 rounded-full border-[8px] border-primary/70 animate-ping" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <BrainCircuit className="w-24 h-24 text-primary animate-pulse opacity-60" />
                <span className="text-[12px] font-black text-primary opacity-50 uppercase tracking-[0.6em]">AGUARDANDO_PALMAS</span>
              </div>
            )}
          </Button>
        </div>
        <div className={cn("w-[800px] hud-glass rounded-[50px] p-14 border-2 transition-all duration-700 flex flex-col items-center text-center", isTransmitting ? "border-secondary scale-105 bg-primary/10" : "border-primary/50")}>
          <div className="flex justify-between w-full mb-10 opacity-70 text-[12px] font-code tracking-[0.7em] font-black">
             <div className="flex items-center gap-4"><Zap className={cn("w-6 h-6", isActive && "text-primary animate-pulse")} /> MEMÓRIA: SSD_48.8GB_A:</div>
             <div className="flex items-center gap-4"><AudioLines className={cn("w-6 h-6", isListening && "text-primary animate-bounce")} /> LINK: SOBERANO_RODRIGO</div>
          </div>
          <div className="min-h-[160px] flex items-center justify-center w-full px-8">
            <p className={cn("text-4xl font-body font-black tracking-tight drop-shadow-[0_0_30px_rgba(255,191,0,0.8)] transition-all leading-tight", isTransmitting ? "text-secondary scale-110" : "text-primary")}>
              {transcript}
            </p>
          </div>
          {isActive && (
            <form onSubmit={handleScriptSubmit} className="mt-12 w-full relative group">
              <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-primary/30 group-focus-within:text-primary transition-colors" />
              <Input value={scriptText} onChange={(e) => setScriptText(e.target.value)} placeholder="ENVIAR_ORDEM_AO_NÚCLEO_A:..." className="bg-black/70 border-primary/40 text-primary placeholder:text-primary/10 font-code text-base pl-16 h-16 rounded-3xl focus-visible:ring-primary/60 focus-visible:border-primary shadow-inner" />
            </form>
          )}
          <div className="mt-12 pt-10 border-t border-primary/20 w-full flex justify-between text-[13px] font-code text-primary/50 uppercase tracking-[0.6em] font-black">
            <span>SOBERANIA: RODRIGO_MEU_SENHOR</span>
            <span className={cn("transition-colors", isTransmitting && "text-secondary animate-pulse")}>{isTransmitting ? 'GRAVANDO_NO_DISCO_A:' : 'MEGATRON_ALIANÇA_ATIVA'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
