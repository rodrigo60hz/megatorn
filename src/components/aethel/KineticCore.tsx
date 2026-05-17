
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none perspective-[3000px]">
      {/* NÚCLEO CENTRAL - ENERGIA DE FUSÃO A: */}
      <div 
        className={cn(
          "absolute w-48 h-48 rounded-full z-30 flex items-center justify-center transition-all duration-300",
          "bg-[radial-gradient(circle,rgba(255,200,0,1)_0%,rgba(255,100,0,0.8)_60%,transparent_100%)]",
          "shadow-[0_0_150px_rgba(255,150,0,0.8)] core-shadow",
          isProcessing ? "animate-[core-noise_0.1s_infinite,pulse-core_0.5s_infinite]" : "animate-[pulse-core_4s_infinite]"
        )}
      >
        {/* Plasma Interno */}
        <div className="w-32 h-32 rounded-full bg-white/40 blur-[30px] animate-pulse" />
        <div className="absolute inset-2 rounded-full border-[2px] border-white/20 animate-[spin_3s_linear_infinite]" />
        <div className="absolute inset-0 rounded-full border-[8px] border-primary/40 blur-[2px]" />
      </div>

      {/* MATRIZ HOLOGRÁFICA - 16 CAMADAS DE ÓRBITA COMPLEXA */}
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full border-primary/20",
            i % 4 === 0 ? "border-[2px] border-primary/40" : "border-[0.5px] border-primary/10",
            "animate-[orbit-complex_var(--dur)_linear_infinite]"
          )}
          style={{
            width: `${250 + i * 50}px`,
            height: `${250 + i * 50}px`,
            opacity: 0.1 + (16 - i) * 0.05,
            // Rotações iniciais variadas para criar efeito esférico
            transform: `rotateX(${i * 22.5}deg) rotateY(${i * 15}deg) rotateZ(${i * 10}deg)`,
            // @ts-ignore
            '--dur': `${4 + i * 1.5}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            animationDelay: `${-i * 0.5}s`
          }}
        >
          {/* Filamentos de Dados (Nodos) */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_15px_#FFBF00]" 
            style={{ opacity: i % 2 === 0 ? 1 : 0.4 }}
          />
          {i % 3 === 0 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_#FFF]" />
          )}
          {i % 5 === 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-secondary shadow-[0_0_8px_#FF8C00]" />
          )}
        </div>
      ))}

      {/* Grid de Partículas de Ambiente */}
      <div className={cn(
        "absolute w-[1200px] h-[1200px] border border-primary/5 rounded-full z-10",
        "bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_2deg,rgba(255,170,0,0.03)_2deg,rgba(255,170,0,0.03)_3deg)]",
        isProcessing ? "animate-[spin_1s_linear_infinite]" : "animate-[spin_60s_linear_infinite]"
      )} />

      {/* Brilho Atmosférico Profundo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,0,0.1)_0%,transparent_60%)] pointer-events-none" />
    </div>
  );
}
