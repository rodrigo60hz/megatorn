"use client"

import React, { useState } from 'react';
import { KineticCore } from '@/components/aethel/KineticCore';
import { TelemetryHUD } from '@/components/aethel/TelemetryHUD';
import { VoiceLink } from '@/components/aethel/VoiceLink';

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

      {/* Minimalist Telemetry HUD */}
      <TelemetryHUD />

      {/* Voice Link Core */}
      <VoiceLink onProcessingChange={setIsProcessing} />

      {/* Corner Accents - Pure aesthetic */}
      <div className="fixed top-0 left-0 w-24 h-24 border-t border-l border-primary/10 m-6 pointer-events-none" />
      <div className="fixed top-0 right-0 w-24 h-24 border-t border-r border-primary/10 m-6 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-24 h-24 border-b border-l border-primary/10 m-6 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-b border-r border-primary/10 m-6 pointer-events-none" />
    </main>
  );
}
