"use client"

import React, { useState } from 'react';
import { KineticCore } from '@/components/aethel/KineticCore';
import { TelemetryHUD } from '@/components/aethel/TelemetryHUD';
import { CognitiveProcessor } from '@/components/aethel/CognitiveProcessor';
import { VoiceLink } from '@/components/aethel/VoiceLink';
import { Activity, Shield, Zap, Layers } from 'lucide-react';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden scanline-effect select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05)_0%,transparent_70%)]" />
      <div className="absolute inset-0 digital-noise" />

      {/* Main Kinetic Hub */}
      <div className="absolute inset-0 z-0">
        <KineticCore isProcessing={isProcessing} />
      </div>

      {/* Persistent UI Overlays */}
      <TelemetryHUD />

      {/* System Quick Controls (Floating Panels) */}
      <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-40 flex gap-12 opacity-40 hover:opacity-100 transition-opacity duration-500 font-headline text-[10px] tracking-widest text-primary/80">
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="p-2 border border-primary/20 rounded-full group-hover:bg-primary/10 transition-colors">
            <Zap className="w-4 h-4" />
          </div>
          <span>POWER_SYNC</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="p-2 border border-primary/20 rounded-full group-hover:bg-primary/10 transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <span>DEFENSE_GRID</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="p-2 border border-primary/20 rounded-full group-hover:bg-primary/10 transition-colors">
            <Activity className="w-4 h-4" />
          </div>
          <span>SYSTEM_HEALTH</span>
        </div>
        <div className="flex flex-col items-center gap-2 group cursor-pointer">
          <div className="p-2 border border-primary/20 rounded-full group-hover:bg-primary/10 transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <span>LAYERS_MGR</span>
        </div>
      </div>

      {/* Interactions */}
      <CognitiveProcessor onProcessingChange={setIsProcessing} />
      <VoiceLink onProcessingChange={setIsProcessing} />

      {/* Corner Accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/20 m-4 pointer-events-none" />
      <div className="fixed top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/20 m-4 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 m-4 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/20 m-4 pointer-events-none" />
    </main>
  );
}