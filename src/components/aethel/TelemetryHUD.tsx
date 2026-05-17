"use client"

import React, { useState, useEffect } from 'react';
import { Clock, Cpu, HardDrive, BrainCircuit, Activity, Zap, ShieldCheck, MonitorDown } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4, sync: 100.0, free: 48.7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: 15 + Math.floor(Math.random() * 15),
        temp: 38 + Math.floor(Math.random() * 4),
        ram: 3.1 + Math.random() * 0.1,
        sync: 100.0,
        free: 48.7 + Math.random() * 0.02 
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* HUD Esquerdo: Telemetria de Disco Minimalista */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-4 font-code animate-in fade-in duration-1000">
        <div className="flex flex-col gap-3 p-5 border border-primary/20 hud-glass rounded-xl w-64 shadow-[0_0_30px_rgba(255,191,0,0.05)]">
          <div className="flex justify-between items-center text-[9px] text-primary font-black tracking-widest">
            <span className="flex items-center gap-2"><HardDrive className="w-3 h-3" /> SSD_A:</span>
            <span className="animate-pulse">{metrics.free.toFixed(1)} GB</span>
          </div>
          <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary shadow-[0_0_15px_#FFBF00] transition-all duration-300" 
              style={{ width: `${(1 - (metrics.free / 48.8)) * 100}%` }} 
            />
          </div>
          <div className="flex justify-between items-center text-[8px] text-primary/40 font-black tracking-widest uppercase">
            <span>Status: Ancorado</span>
            <ShieldCheck className="w-2 h-2" />
          </div>
        </div>
      </div>

      {/* HUD Direito: Tempo e Pulso de Sistema */}
      <div className="fixed bottom-8 right-8 z-50 text-right animate-in fade-in duration-1000 delay-300 font-code">
        <div className="flex flex-col gap-2 items-end">
          <div className="text-4xl font-black tracking-tighter text-primary/80 drop-shadow-[0_0_20px_rgba(255,191,0,0.4)]">{time}</div>
          <div className="flex gap-4 text-[8px] text-primary/50 font-black tracking-widest uppercase">
            <div className="flex items-center gap-1"><Activity className="w-2 h-2 animate-pulse" /> SBF_OK</div>
            <div className="flex items-center gap-1"><Zap className="w-2 h-2" /> V12_LINK</div>
            <div className="flex items-center gap-1"><MonitorDown className="w-2 h-2" /> GITHUB_SYNC</div>
          </div>
        </div>
      </div>

      {/* Identificação de Soberania Minimalista */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 opacity-20 hover:opacity-100 transition-opacity duration-500 font-headline text-[10px] tracking-[1em] text-primary font-bold uppercase pointer-events-none">
        Megatron Control Core A:
      </div>
    </>
  );
}
