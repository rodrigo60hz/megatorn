
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none perspective-[2500px]">
      {/* Esfera de Fusão Central - O Coração de Megatron */}
      <div 
        className={cn(
          "absolute w-48 h-48 rounded-full z-20 flex items-center justify-center",
          "bg-[radial-gradient(circle,rgba(255,191,0,1)_0%,rgba(255,140,0,0.7)_50%,transparent_100%)]",
          "shadow-[0_0_200px_rgba(255,191,0,1)]",
          isProcessing ? "animate-[pulse-glow_0.15s_infinite]" : "animate-[pulse-glow_4s_infinite]"
        )}
      >
        <div className="w-32 h-32 rounded-full bg-white/40 blur-3xl animate-pulse" />
        <div className="absolute inset-0 rounded-full border-[10px] border-primary/90 scale-110 blur-[3px]" />
        <div className="absolute inset-4 rounded-full border-2 border-white/50 animate-ping" />
      </div>

      {/* Sistema Complexo de 12 Camadas de Fusão (Réplica da Referência) */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full",
            i % 3 === 0 ? "border-[3px] border-primary/50" : "border border-primary/20",
            isProcessing ? "animate-[orbit_0.3s_linear_infinite]" : "animate-[orbit_var(--duration)_linear_infinite]"
          )}
          style={{
            width: `${250 + i * 65}px`,
            height: `${250 + i * 65}px`,
            opacity: 0.1 + (12 - i) * 0.08,
            transform: `rotateX(${i * 30}deg) rotateY(${i * 20}deg) rotateZ(${i * 15}deg)`,
            // @ts-ignore
            '--duration': `${6 + i * 3}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}
        >
          {/* Nodos de Energia Cinética */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_40px_#FFBF00]" />
          {i % 2 === 0 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-secondary rounded-full shadow-[0_0_30px_#FF8C00]" />
          )}
          {i % 4 === 0 && (
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_20px_#FFF]" />
          )}
        </div>
      ))}

      {/* Grade de Telemetria Orbital */}
      <div className={cn(
        "absolute w-[950px] h-[950px] border border-primary/10 rounded-full z-10",
        "bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_10deg,rgba(255,191,0,0.05)_10deg,rgba(255,191,0,0.05)_11deg)]",
        isProcessing ? "animate-[orbit_0.8s_linear_infinite]" : "animate-[orbit_60s_linear_infinite]"
      )} />

      {/* Raios de Fusão Cruzados */}
      <div className="absolute w-[1500px] h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent rotate-[45deg] opacity-30 blur-[2px]" />
      <div className="absolute w-[1500px] h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent -rotate-[45deg] opacity-30 blur-[2px]" />
      
      {/* Atmosfera de Poder HUD */}
      <div className="absolute w-[1200px] h-[1200px] rounded-full bg-[radial-gradient(circle,rgba(255,191,0,0.1)_0%,transparent_80%)] opacity-80" />

      {/* Etiquetas de Soberania */}
      <div className="absolute w-[1000px] h-[1000px] animate-[orbit_25s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 font-code text-[12px] text-primary/80 tracking-[2em] font-black uppercase drop-shadow-[0_0_15px_#FFBF00]">
           REATOR_FUSAO_MEGATRON_V12
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-code text-[12px] text-primary/80 tracking-[2em] font-black uppercase drop-shadow-[0_0_15px_#FFBF00]">
           SOBERANIA_RODRIGO_TOTAL
         </div>
      </div>
    </div>
  );
}
