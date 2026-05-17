
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none perspective-[3000px]">
      {/* NÚCLEO CENTRAL - PLASMA DE ENERGIA A: */}
      <div 
        className={cn(
          "absolute w-40 h-40 rounded-full z-30 flex items-center justify-center transition-all duration-300",
          "bg-[radial-gradient(circle,rgba(255,200,0,1)_0%,rgba(255,100,0,0.8)_60%,transparent_100%)]",
          "shadow-[0_0_100px_rgba(255,150,0,0.6)] core-shadow",
          isProcessing ? "animate-[core-noise_0.1s_infinite,pulse-core_0.5s_infinite]" : "animate-[pulse-core_4s_infinite]"
        )}
      >
        {/* Plasma Interno e Brilho de Processamento */}
        <div className="w-24 h-24 rounded-full bg-white/30 blur-[20px] animate-pulse" />
        <div className="absolute inset-4 rounded-full border-[1px] border-white/20 animate-[spin_2s_linear_infinite]" />
        <div className="absolute inset-0 rounded-full border-[4px] border-primary/30 blur-[1px]" />
      </div>

      {/* MATRIZ HOLOGRÁFICA ESFÉRICA - 16 CAMADAS DE ÓRBITA COMPLEXA */}
      <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute rounded-full border-primary/20",
              i % 4 === 0 ? "border-[1.5px] border-primary/40" : "border-[0.5px] border-primary/10",
              "animate-[orbit-complex_var(--dur)_linear_infinite]"
            )}
            style={{
              width: `${300 + i * 40}px`,
              height: `${300 + i * 40}px`,
              opacity: 0.15 + (16 - i) * 0.04,
              // Rotação em múltiplos eixos para formar a esfera (Newton/Stark style)
              transform: `rotateX(${i * 22.5}deg) rotateY(${i * 11.25}deg) rotateZ(${i * 45}deg)`,
              // @ts-ignore
              '--dur': `${6 + i * 1.2}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
              animationDelay: `${-i * 0.7}s`
            }}
          >
            {/* MINI DETALHES: Nodos de Dados e Filamentos de Luz */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_12px_#FFBF00]" 
              style={{ opacity: i % 2 === 0 ? 1 : 0.5 }}
            />
            {i % 3 === 0 && (
              <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#FFF] opacity-60" />
            )}
            {i % 5 === 0 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[0.5px] bg-secondary shadow-[0_0_10px_#FF8C00] opacity-80" />
            )}
            
            {/* Anéis Internos de Interferência */}
            <div className="absolute inset-4 rounded-full border-[0.2px] border-primary/5 border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
        ))}
      </div>

      {/* Grid de Partículas Atmosféricas (Micro-poeira digital) */}
      <div className={cn(
        "absolute w-[1000px] h-[1000px] border border-primary/5 rounded-full z-10",
        "bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_1deg,rgba(255,170,0,0.02)_1deg,rgba(255,170,0,0.02)_2deg)]",
        isProcessing ? "animate-[spin_2s_linear_infinite]" : "animate-[spin_80s_linear_infinite]"
      )} />

      {/* Brilho Atmosférico Ambar Profundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,0,0.08)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
}
