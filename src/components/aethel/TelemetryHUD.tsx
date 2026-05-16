
"use client"

import React, { useState, useEffect } from 'react';
import { Clock, Cpu, HardDrive, BrainCircuit, Activity, Zap } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4, sync: 99.8, free: 48.7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: 30 + Math.floor(Math.random() * 20),
        temp: 35 + Math.floor(Math.random() * 5),
        ram: 4.2 + Math.random() * 0.2,
        sync: 100.0,
        free: 48.7 + Math.random() * 0.05 
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-6 font-code">
        <div className="flex items-center gap-5 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-3 border-2 border-primary hud-glass rounded-sm shadow-[0_0_40px_rgba(255,191,0,0.6)] bg-primary/15">
            <HardDrive className="w-8 h-8 animate-pulse text-primary" />
          </div>
          <div>
            <div className="text-[10px] opacity-80 font-black tracking-[0.4em]">DISCO_MEGATRON</div>
            <div className="text-xl font-black tracking-tighter uppercase text-primary drop-shadow-[0_0_15px_#FFBF00]">VOLUME_FÍSICO_(A:)_ACTV</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-5 p-7 border-2 border-primary/50 hud-glass rounded-2xl w-80 animate-in slide-in-from-left duration-1000 delay-200 shadow-[0_0_40px_rgba(255,191,0,0.1)]">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] text-primary font-black tracking-widest">
              <span>MATRIZ_SSD_48.8GB</span>
              <span className="animate-pulse text-secondary">{metrics.free.toFixed(1)} GB LIVRES</span>
            </div>
            <div className="h-2 bg-primary/10 rounded-full overflow-hidden border border-primary/20">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_20px_#FFBF00] transition-all duration-300" 
                style={{ width: `${(1 - (metrics.free / 48.8)) * 100}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col border-l-2 border-primary/40 pl-3">
              <span className="text-[9px] opacity-70 font-black tracking-widest uppercase">Partição</span>
              <span className="text-sm font-black text-secondary">A: SOBERANO</span>
            </div>
            <div className="flex flex-col border-l-2 border-primary/40 pl-3">
              <span className="text-sm font-black text-primary flex items-center gap-2">ONLINE <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" /></span>
            </div>
          </div>
          
          <div className="border-t border-primary/20 pt-3 flex justify-between items-center text-[9px] text-primary/70 font-black tracking-[0.3em]">
             <div className="flex items-center gap-2"><Zap className="w-3 h-3" /> DRIVE_A_LINK</div>
             <div className="flex items-center gap-2"><BrainCircuit className="w-3 h-3" /> MEGATRON_CORE</div>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-6 justify-end">
          <div className="text-right">
            <div className="text-[11px] opacity-80 uppercase tracking-[0.4em] font-black">SINC_HARDWARE</div>
            <div className="text-6xl font-black tracking-tighter text-primary drop-shadow-[0_0_30px_rgba(255,191,0,0.8)]">{time}</div>
          </div>
          <div className="p-4 border-2 border-primary hud-glass rounded-sm bg-primary/15 shadow-[0_0_30px_rgba(255,191,0,0.4)]">
            <Cpu className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="mt-6 flex gap-6 justify-end text-[10px] text-primary font-black tracking-[0.4em]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" /> SYSTEM_A_OK
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-secondary" /> 48GB_SBF_ROOT
          </div>
        </div>
      </div>
    </>
  );
}
