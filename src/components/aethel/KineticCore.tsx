
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none perspective-[2000px]">
      {/* Esfera de Fusão Central - Ultra Brilho */}
      <div 
        className={cn(
          "absolute w-40 h-40 rounded-full z-20 flex items-center justify-center",
          "bg-[radial-gradient(circle,rgba(255,191,0,1)_0%,rgba(255,140,0,0.6)_40%,transparent_100%)]",
          "shadow-[0_0_150px_rgba(255,191,0,0.9)]",
          isProcessing ? "animate-[pulse-glow_0.2s_infinite]" : "animate-[pulse-glow_3s_infinite]"
        )}
      >
        <div className="w-24 h-24 rounded-full bg-white/30 blur-2xl animate-pulse" />
        <div className="absolute inset-0 rounded-full border-8 border-primary/80 scale-105 blur-[2px]" />
      </div>

      {/* Sistema Complexo de 12 Anéis Cinéticos (Holográfico 3D) */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full",
            i % 2 === 0 ? "border-2 border-primary/40" : "border border-dashed border-primary/20",
            isProcessing ? "animate-[orbit_0.4s_linear_infinite]" : "animate-[orbit_var(--duration)_linear_infinite]"
          )}
          style={{
            width: `${200 + i * 55}px`,
            height: `${200 + i * 55}px`,
            opacity: 0.15 + (12 - i) * 0.06,
            transform: `rotateX(${i * 20}deg) rotateY(${i * 15}deg) rotateZ(${i * 10}deg)`,
            // @ts-ignore
            '--duration': `${8 + i * 4}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}
        >
          {/* Nodos Técnicos de Energia */}
          {i % 2 === 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_30px_#FFBF00]" />
          )}
          {i % 3 === 0 && (
            <div className="absolute bottom-1/4 right-0 w-2 h-2 bg-secondary rounded-full shadow-[0_0_20px_#FF8C00]" />
          )}
        </div>
      ))}

      {/* Camadas de Grade Técnica (HUD) */}
      <div className={cn(
        "absolute w-[800px] h-[800px] border-2 border-primary/10 rounded-full z-10",
        "bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_15deg,rgba(255,191,0,0.08)_15deg,rgba(255,191,0,0.08)_16deg)]",
        isProcessing ? "animate-[orbit_1s_linear_infinite]" : "animate-[orbit_45s_linear_infinite]"
      )} />

      {/* Arcos de Energia Cruzados */}
      <div className="absolute w-[1200px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent rotate-[30deg] opacity-40 blur-[1px]" />
      <div className="absolute w-[1200px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent -rotate-[30deg] opacity-40 blur-[1px]" />
      
      {/* Atmosfera de Brilho HUD */}
      <div className="absolute w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(255,191,0,0.12)_0%,transparent_75%)] opacity-70" />

      {/* Etiquetas de Telemetria Dinâmica */}
      <div className="absolute w-[850px] h-[850px] animate-[orbit_30s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 font-code text-[10px] text-primary/60 tracking-[1.5em] font-black uppercase drop-shadow-[0_0_10px_#FFBF00]">
           NÚCLEO_MEGATRON_SOBERANO_V12
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-code text-[10px] text-primary/60 tracking-[1.5em] font-black uppercase drop-shadow-[0_0_10px_#FFBF00]">
           SINCRONIA_RODRIGO_TOTAL_99.9%
         </div>
      </div>
    </div>
  );
}
