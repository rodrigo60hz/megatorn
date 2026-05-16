"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface KineticCoreProps {
  isProcessing?: boolean;
}

export function KineticCore({ isProcessing = false }: KineticCoreProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Central Core */}
      <div 
        className={cn(
          "absolute w-32 h-32 rounded-full z-20 border-[3px] border-primary/40 flex items-center justify-center",
          "after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-primary/20 after:animate-pulse",
          isProcessing ? "animate-[pulse-glow_1s_infinite]" : "animate-[pulse-glow_4s_infinite]"
        )}
      >
        <div className="w-20 h-20 rounded-full bg-primary/30 blur-xl animate-pulse" />
        <div className="absolute w-full h-full rounded-full border border-primary/10 scale-125" />
      </div>

      {/* Orbiting Rings */}
      <div className={cn(
        "absolute w-[300px] h-[300px] border-2 border-primary/20 rounded-full z-10",
        "after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full after:shadow-[0_0_10px_#38BDF8]",
        isProcessing ? "animate-[orbit_1.5s_linear_infinite]" : "animate-[orbit_10s_linear_infinite]"
      )} />

      <div className={cn(
        "absolute w-[450px] h-[450px] border border-dashed border-secondary/30 rounded-full z-10",
        "before:content-[''] before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-1.5 before:bg-secondary before:rounded-full",
        isProcessing ? "animate-[orbit-reverse_2s_linear_infinite]" : "animate-[orbit-reverse_20s_linear_infinite]"
      )} />

      <div className={cn(
        "absolute w-[600px] h-[600px] border border-primary/10 rounded-full z-10",
        isProcessing ? "animate-[orbit_3s_linear_infinite]" : "animate-[orbit_40s_linear_infinite]"
      )} />

      {/* Crosshair accents */}
      <div className="absolute w-[800px] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute h-[800px] w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      
      {/* Rotating UI Elements */}
      <div className="absolute w-[520px] h-[520px] animate-[orbit_15s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 font-code text-[10px] text-primary/60 tracking-widest">
           SECTOR_A_928
         </div>
      </div>
    </div>
  );
}