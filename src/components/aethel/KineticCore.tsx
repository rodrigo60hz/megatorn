"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none perspective-[2500px]">
      {/* Esfera de Fusão Central - SSD Memory Core A: */}
      <div 
        className={cn(
          "absolute w-56 h-56 rounded-full z-20 flex items-center justify-center",
          "bg-[radial-gradient(circle,rgba(255,191,0,1)_0%,rgba(255,140,0,0.8)_50%,transparent_100%)]",
          "shadow-[0_0_250px_rgba(255,191,0,1)]",
          isProcessing ? "animate-[pulse-glow_0.1s_infinite]" : "animate-[pulse-glow_3s_infinite]"
        )}
      >
        {/* Pulsações de Memória Disco A: */}
        <div className="w-40 h-40 rounded-full bg-white/50 blur-[50px] animate-pulse" />
        <div className="absolute inset-0 rounded-full border-[12px] border-primary/95 scale-110 blur-[4px]" />
        
        {/* Nodos de Dados */}
        <div className="absolute inset-8 rounded-full border-[1px] border-white/40 animate-[spin_1s_linear_infinite]" />
        <div className="absolute inset-12 rounded-full border-[1px] border-white/20 animate-[spin_2s_linear_infinite_reverse]" />
      </div>

      {/* 12 Camadas de Densidade Cinética - Matriz Megatron A: */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full",
            i % 3 === 0 ? "border-[4px] border-primary/60" : "border-[1px] border-primary/30",
            isProcessing ? "animate-[orbit_0.2s_linear_infinite]" : "animate-[orbit_var(--duration)_linear_infinite]"
          )}
          style={{
            width: `${300 + i * 70}px`,
            height: `${300 + i * 70}px`,
            opacity: 0.15 + (12 - i) * 0.08,
            transform: `rotateX(${i * 30}deg) rotateY(${i * 20}deg) rotateZ(${i * 15}deg)`,
            // @ts-ignore
            '--duration': `${5 + i * 2.5}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}
        >
          {/* Nodos de Memória Iluminados */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full shadow-[0_0_50px_#FFBF00]" />
          {i % 3 === 0 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary rounded-full shadow-[0_0_40px_#FF8C00]" />
          )}
          {i % 4 === 0 && (
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_30px_#FFF]" />
          )}
        </div>
      ))}

      {/* Grid de Memória Disco A: */}
      <div className={cn(
        "absolute w-[1000px] h-[1000px] border border-primary/10 rounded-full z-10",
        "bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_5deg,rgba(255,191,0,0.08)_5deg,rgba(255,191,0,0.08)_6deg)]",
        isProcessing ? "animate-[orbit_0.5s_linear_infinite]" : "animate-[orbit_40s_linear_infinite]"
      )} />

      {/* Etiquetas de Soberania Partição A */}
      <div className="absolute w-[1100px] h-[1100px] animate-[orbit_30s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 font-code text-[14px] text-primary tracking-[1.5em] font-black uppercase drop-shadow-[0_0_10px_#FFBF00]">
           MEGATRON_PARTITION_A_ACTIVE
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-code text-[14px] text-primary tracking-[1.5em] font-black uppercase drop-shadow-[0_0_10px_#FFBF00]">
           PHYSICAL_STORAGE_48GB_ACTV
         </div>
      </div>
    </div>
  );
}