
"use client"

import React, { useState, useEffect } from 'react';
import { HardDrive, ShieldCheck, Activity, Zap, Cpu } from 'lucide-react';

export function TelemetryHUD() {
  const [metrics, setMetrics] = useState({ free: 48.8, load: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics({
        free: 48.8,
        load: 8 + Math.random() * 15
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* HUD Esquerdo: Status do Cérebro A: */}
      <div className="fixed top-12 left-12 z-50 flex flex-col gap-8 font-code animate-in fade-in slide-in-from-left duration-1000">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[10px] text-primary font-black tracking-[0.3em]">
            <HardDrive className="w-4 h-4" /> SSD_PARTITION_A
          </div>
          <div className="text-[24px] font-headline font-black text-primary/80">48.8 GB</div>
          <div className="w-32 h-0.5 bg-primary/20 relative">
            <div className="absolute inset-0 bg-primary shadow-[0_0_10px_#FFBF00]" style={{ width: '100%' }} />
          </div>
          <div className="text-[7px] text-primary/40 tracking-widest">ESTADO: RESIDENTE_SBF</div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-[10px] text-primary/60 font-black tracking-[0.3em]">
            <Cpu className="w-4 h-4" /> NEURAL_LOAD
          </div>
          <div className="text-[18px] font-headline font-black text-primary/60">{metrics.load.toFixed(1)}%</div>
          <div className="w-32 h-0.5 bg-primary/10">
            <div className="h-full bg-primary/40" style={{ width: `${metrics.load}%` }} />
          </div>
        </div>
      </div>

      {/* HUD Direito: Status do Sistema */}
      <div className="fixed top-12 right-12 z-50 flex flex-col gap-6 items-end font-code animate-in fade-in slide-in-from-right duration-1000 delay-300">
        <div className="flex items-center gap-2 text-[8px] text-primary/40 tracking-[0.5em]">
          <ShieldCheck className="w-3 h-3" /> SECURITY_ACTIVE
        </div>
        <div className="flex items-center gap-2 text-[8px] text-primary/40 tracking-[0.5em]">
          <Activity className="w-3 h-3 animate-pulse" /> SYNC_GITHUB_OK
        </div>
        <div className="flex items-center gap-2 text-[8px] text-primary/40 tracking-[0.5em]">
          <Zap className="w-3 h-3" /> V12_POWER_STABLE
        </div>
      </div>

      {/* Background Grid - Minimalist */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,191,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,191,0,0.1)_1px,transparent_1px)] bg-[size:100px_100px]" />
    </>
  );
}
