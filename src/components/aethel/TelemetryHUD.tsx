
"use client"

import React, { useState, useEffect } from 'react';
import { Radio, Clock, Thermometer, Wifi, Activity } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4, sync: 99.8 });

  useEffect(() => {
    // Atualização instantânea a cada segundo para precisão tática
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: 20 + Math.floor(Math.random() * 8),
        temp: 42 + Math.floor(Math.random() * 5),
        ram: 4.8 + Math.random() * 0.1,
        sync: 99.4 + Math.random() * 0.5
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Top Left - System Vitality */}
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-5 font-code">
        <div className="flex items-center gap-4 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-2.5 border border-primary/40 hud-glass rounded-sm shadow-[0_0_15px_rgba(255,191,0,0.2)]">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] opacity-60 font-bold tracking-[0.3em]">MEGATRON_CORE_V6</div>
            <div className="text-sm font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_5px_#FFBF00]">NÚCLEO_OURO_SINCRO</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 p-5 border border-primary/20 hud-glass rounded-xl w-64 animate-in slide-in-from-left duration-1000 delay-200">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-primary/80 font-bold">
              <span>CARGA_COGNITIVA</span>
              <span>{metrics.cpu}%</span>
            </div>
            <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary shadow-[0_0_15px_#FFBF00] transition-all duration-1000 ease-in-out" 
                style={{ width: `${metrics.cpu}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] opacity-50 font-bold">TEMPERATURA</span>
              <span className="text-xs font-bold text-secondary">{metrics.temp}°C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] opacity-50 font-bold">LATÊNCIA_NEURAL</span>
              <span className="text-xs font-bold text-primary">{metrics.sync}%</span>
            </div>
          </div>
          
          <div className="border-t border-primary/10 pt-2 flex justify-between items-center text-[9px] text-primary/50 font-bold">
             <span>REF_ID: 0xRodrigo</span>
             <span>VER: 1.0.0_GOLD</span>
          </div>
        </div>
      </div>

      {/* Top Right - Chrono & Comms */}
      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-5 justify-end">
          <div className="text-right">
            <div className="text-[11px] opacity-60 uppercase tracking-[0.4em] font-bold">Tempo de Comando</div>
            <div className="text-5xl font-bold tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(255,191,0,0.6)]">{time}</div>
          </div>
          <div className="p-3 border border-primary/40 hud-glass rounded-sm">
            <Clock className="w-9 h-9 text-primary" />
          </div>
        </div>
        
        <div className="mt-5 flex gap-5 justify-end text-[10px] text-primary/60 font-bold tracking-[0.2em]">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5" /> AMBIENTE: 19.5°C
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" /> UPLINK_STABLE: 0.2ms
          </div>
        </div>
      </div>

      {/* Bottom Metrics - Deep Sync */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-12 flex justify-between items-end animate-in fade-in duration-1000">
        <div className="text-[10px] font-code text-primary/40 flex gap-8 tracking-[0.2em] font-bold">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" /> SCANNING_SECTOR_07</span>
          <span>COOR: 23.5505 S | 46.6333 W</span>
          <span>ESTADO: SOBERANIA_RODRIGO</span>
        </div>
        <div className="text-[11px] font-code text-primary/40 text-right font-bold tracking-[0.3em] uppercase">
          AI_MEGATRON_X_RODRIGO_MEU_SENHOR
        </div>
      </div>
    </>
  );
}
