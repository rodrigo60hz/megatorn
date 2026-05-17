
"use client"

import React, { useState } from 'react';
import { KineticCore } from '@/components/aethel/KineticCore';
import { TelemetryHUD } from '@/components/aethel/TelemetryHUD';
import { VoiceLink } from '@/components/aethel/VoiceLink';
import { MonitorCheck } from 'lucide-react';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <main className="relative w-screen h-screen overflow-hidden scanline-effect select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.05)_0%,transparent_70%)]" />
      <div className="absolute inset-0 digital-noise" />

      {/* Main Kinetic Hub */}
      <div className="absolute inset-0 z-0">
        <KineticCore isProcessing={isProcessing} />
      </div>

      {/* Persistent UI Overlays */}
      <TelemetryHUD />

      {/* Deployment Badge - Confirmação de programa Windows */}
      <div className="fixed top-1/2 left-8 -translate-y-1/2 flex flex-col gap-4 opacity-50">
        <div className="flex items-center gap-3 text-secondary animate-pulse">
           <MonitorCheck className="w-5 h-5" />
           <span className="text-[10px] font-code font-black tracking-[0.4em] vertical-text">SISTEMA_ANCORADO_AO_PC_WINDOWS</span>
        </div>
      </div>

      {/* Voice Interactions - Only Interaction Point */}
      <VoiceLink onProcessingChange={setIsProcessing} />

      {/* Corner Accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-primary/20 m-4 pointer-events-none" />
      <div className="fixed top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/20 m-4 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-primary/20 m-4 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-primary/20 m-4 pointer-events-none" />
    </main>
  );
}
