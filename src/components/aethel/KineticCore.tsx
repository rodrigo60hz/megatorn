"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Central Core - High Intensity Golden Orb */}
      <div 
        className={cn(
          "absolute w-40 h-40 rounded-full z-20 border-[4px] border-primary/60 flex items-center justify-center",
          "after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-primary/40 after:animate-pulse",
          "shadow-[0_0_100px_rgba(255,191,0,0.4)]",
          isProcessing ? "animate-[pulse-glow_0.5s_infinite]" : "animate-[pulse-glow_3s_infinite]"
        )}
      >
        <div className="w-24 h-24 rounded-full bg-primary/40 blur-2xl animate-pulse" />
        <div className="absolute w-full h-full rounded-full border-2 border-primary/30 scale-125" />
        <div className="absolute w-full h-full rounded-full border border-secondary/20 scale-150 rotate-45" />
      </div>

      {/* Orbiting Rings - High Density Like Reference Image */}
      {/* Ring 1 - Fast Inner */}
      <div className={cn(
        "absolute w-[350px] h-[350px] border-2 border-primary/40 rounded-full z-10",
        "after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-3 after:h-3 after:bg-primary after:rounded-full after:shadow-[0_0_20px_#FFBF00]",
        isProcessing ? "animate-[orbit_1s_linear_infinite]" : "animate-[orbit_8s_linear_infinite]"
      )} />

      {/* Ring 2 - Reverse Heavy */}
      <div className={cn(
        "absolute w-[420px] h-[420px] border-[3px] border-secondary/20 rounded-full z-10 border-t-primary/60 border-b-primary/60",
        isProcessing ? "animate-[orbit-reverse_1.5s_linear_infinite]" : "animate-[orbit-reverse_12s_linear_infinite]"
      )} />

      {/* Ring 3 - Dashed Tech */}
      <div className={cn(
        "absolute w-[500px] h-[500px] border border-dashed border-primary/30 rounded-full z-10",
        "before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-2 before:bg-secondary before:rounded-full",
        isProcessing ? "animate-[orbit_2s_linear_infinite]" : "animate-[orbit_25s_linear_infinite]"
      )} />

      {/* Ring 4 - Outer Large */}
      <div className={cn(
        "absolute w-[650px] h-[650px] border border-primary/10 rounded-full z-10",
        isProcessing ? "animate-[orbit-reverse_4s_linear_infinite]" : "animate-[orbit-reverse_45s_linear_infinite]"
      )} />

      {/* Crosshair accents - Amber */}
      <div className="absolute w-[900px] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute h-[900px] w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      
      {/* Particle Simulation (CSS Visuals) */}
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(255,191,0,0.05)_0%,transparent_70%)] opacity-50" />
      </div>

      {/* Rotating UI Elements */}
      <div className="absolute w-[580px] h-[580px] animate-[orbit_20s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 font-code text-[11px] text-primary/80 tracking-[0.3em] font-bold">
           MEGATRON_CORE_INIT_0xFF
         </div>
      </div>
    </div>
  );
}