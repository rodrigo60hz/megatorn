
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
  }
}

// Pequeno sinal de áudio para desbloquear o contexto do navegador
const SILENCE_WAV = "data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQQAAAAEAA==";

export function VoiceLink({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('SISTEMA_OFFLINE');
  const [clapDetected, setClapDetected] = useState(false);
  const [scriptText, setScriptText] = useState('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
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
      // Ignorar erros de inicialização repetida
    }
  }, [isPlaying, isListening]);

  const initClapDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudio = () => {
        if (!isSystemActiveRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for(let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        // Sensibilidade para detecção de impacto (palmas)
        if (average > 85) { 
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
    } catch (err) {
      console.warn("SENSOR_ACUSTICO_OFF");
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; 
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) handleProcessInput(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = 1.0;
      audio.onplay = () => {
        setIsPlaying(true);
        setIsListening(false);
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

  const toggleSystemPower = () => {
    if (isActive) {
      setIsActive(false);
      isSystemActiveRef.current = false;
      recognitionRef.current?.stop();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      setTranscript('SISTEMA_OFFLINE');
    } else {
      setIsActive(true);
      isSystemActiveRef.current = true;
      setTranscript('MEGATRON_ONLINE (BATA 2 PALMAS)');
      
      if (audioRef.current) {
        audioRef.current.src = SILENCE_WAV;
        audioRef.current.play().catch(() => console.warn("AUDIO_INIT_PENDING"));
      }
      initClapDetection();
    }
  };

  const handleProcessInput = async (query: string) => {
    if (isProcessingRef.current || !query.trim()) return;
    isProcessingRef.current = true;
    onProcessingChange(true);
    setTranscript('MEGATRON_PROCESSANDO...');

    try {
      const result = await aiVoiceInteraction(query);
      setTranscript(result.text);
      
      if (result.audio && audioRef.current) {
        audioRef.current.src = result.audio;
        audioRef.current.play().catch(e => console.error("ERRO_VOZ_MEGATRON:", e));
      }
    } catch (err) {
      setTranscript('FALHA_UPLINK_NEURAL');
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
      <div className="pointer-events-auto flex flex-col items-center gap-8 animate-in zoom-in duration-1000">
        
        {/* Central Interaction Hub */}
        <div className="relative group">
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/40 blur-[80px] scale-150 transition-opacity duration-1000",
            isActive ? "opacity-100" : "opacity-0"
          )} />
          
          <Button 
            onClick={toggleSystemPower}
            className={cn(
              "w-52 h-52 rounded-full border-[6px] transition-all duration-700 relative z-10 flex items-center justify-center overflow-hidden",
              !isActive ? "bg-black/90 border-primary/20 hover:border-primary/60" :
              isPlaying ? "bg-primary/40 border-primary shadow-[0_0_150px_#FFBF00] scale-110" :
              isListening ? "bg-primary/20 border-primary animate-pulse scale-105" :
              "bg-primary/10 border-primary/40"
            )}
          >
            {!isActive ? (
              <div className="flex flex-col items-center gap-3">
                <Power className="w-20 h-20 text-primary/40" />
                <span className="text-[10px] font-black text-primary animate-pulse tracking-widest uppercase">ATIVAR_SISTEMA</span>
              </div>
            ) : isPlaying ? (
              <div className="flex gap-2 items-center justify-center h-full">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className="w-3 bg-primary rounded-full animate-bounce" 
                    style={{ 
                      height: `${60 + Math.random() * 80}px`, 
                      animationDuration: `${0.1 + i * 0.05}s`,
                      boxShadow: '0 0 25px #FFBF00'
                    }} 
                  />
                ))}
              </div>
            ) : isListening ? (
              <div className="relative flex items-center justify-center">
                <Mic className="w-24 h-24 text-primary drop-shadow-[0_0_30px_#FFBF00]" />
                <div className="absolute w-40 h-40 rounded-full border-4 border-primary/60 animate-ping" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-20 h-20 text-primary animate-spin" />
                <span className="text-[9px] font-black text-primary opacity-60 uppercase tracking-widest">AGUARDANDO_PALMAS</span>
              </div>
            )}
          </Button>
        </div>

        {/* Status Display */}
        <div className="w-[450px] bg-black/80 backdrop-blur-md rounded-2xl p-8 border-2 border-primary/50 flex flex-col items-center text-center shadow-[0_0_100px_rgba(255,191,0,0.2)]">
          <div className="flex justify-between w-full mb-4 opacity-50 text-[10px] font-code tracking-[0.5em] font-black">
             <div className="flex items-center gap-2">
               <Zap className={cn("w-3 h-3", isActive && "text-primary animate-pulse")} />
               MEGATRON_CORE_V5
             </div>
             <div className="flex items-center gap-2">
               <AudioLines className={cn("w-3 h-3", clapDetected && "text-primary animate-bounce")} />
               SENSOR_PALMAS
             </div>
          </div>
          
          <p className="text-xl font-body text-primary leading-tight font-black tracking-tight drop-shadow-[0_0_10px_rgba(255,191,0,0.4)] min-h-[60px] flex items-center justify-center">
            {transcript}
          </p>

          {/* Script Input Area */}
          {isActive && (
            <form onSubmit={handleScriptSubmit} className="mt-6 w-full relative group/input">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
              <Input 
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="SCRIPT_VOZ_DIRETO..."
                className="bg-primary/5 border-primary/20 text-primary placeholder:text-primary/10 font-code text-[11px] pl-10 h-10 rounded-lg focus-visible:ring-primary/40"
              />
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-primary/20 w-full flex justify-between text-[10px] font-code text-primary/40 uppercase tracking-[0.3em] font-black">
            <span>SOBERANO_RODRIGO</span>
            <span>UPLINK_ATIVO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
