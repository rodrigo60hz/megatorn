
"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none perspective-[1000px]">
      {/* Central Core - High Intensity Fusion Orb */}
      <div 
        className={cn(
          "absolute w-32 h-32 rounded-full z-20 flex items-center justify-center",
          "bg-[radial-gradient(circle,rgba(255,191,0,0.9)_0%,rgba(255,191,0,0.4)_50%,transparent_100%)]",
          "shadow-[0_0_120px_rgba(255,191,0,0.8)]",
          isProcessing ? "animate-[pulse-glow_0.3s_infinite]" : "animate-[pulse-glow_4s_infinite]"
        )}
      >
        <div className="w-16 h-16 rounded-full bg-white/20 blur-xl animate-pulse" />
        <div className="absolute inset-0 rounded-full border-4 border-primary/60 scale-110 blur-[1px]" />
      </div>

      {/* Complex Ring System - Layered for 3D density */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full border-primary/20",
            i % 2 === 0 ? "border" : "border-dashed",
            isProcessing ? "animate-[orbit_0.5s_linear_infinite]" : "animate-[orbit_var(--duration)_linear_infinite]"
          )}
          style={{
            width: `${150 + i * 45}px`,
            height: `${150 + i * 45}px`,
            borderWidth: i % 3 === 0 ? '2px' : '1px',
            opacity: 0.1 + (12 - i) * 0.05,
            transform: `rotateX(${i * 15}deg) rotateY(${i * 10}deg)`,
            // @ts-ignore
            '--duration': `${10 + i * 5}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
          }}
        >
          {/* Technical Nodes on Rings */}
          {i % 3 === 0 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_#FFBF00]" />
          )}
        </div>
      ))}

      {/* Scanned Technical Data Layers */}
      <div className={cn(
        "absolute w-[600px] h-[600px] border border-primary/10 rounded-full z-10",
        "bg-[repeating-conic-gradient(from_0deg,transparent_0deg,transparent_10deg,rgba(255,191,0,0.05)_10deg,rgba(255,191,0,0.05)_11deg)]",
        isProcessing ? "animate-[orbit_2s_linear_infinite]" : "animate-[orbit_60s_linear_infinite]"
      )} />

      {/* Energy Arcs (Visual only) */}
      <div className="absolute w-[800px] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent rotate-45 opacity-30" />
      <div className="absolute w-[800px] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent -rotate-45 opacity-30" />
      
      {/* Outer Atmosphere Glow */}
      <div className="absolute w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(255,191,0,0.08)_0%,transparent_70%)] opacity-60" />

      {/* Technical Labels */}
      <div className="absolute w-[700px] h-[700px] animate-[orbit_40s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 font-code text-[9px] text-primary/40 tracking-[1em] font-bold uppercase">
           Megatron_Core_V3_Santa_Cruz
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-code text-[9px] text-primary/40 tracking-[1em] font-bold uppercase">
           Soberania_Rodrigo_Total
         </div>
      </div>
    </div>
  );
}
