"use client"

import React, { useState, useEffect } from 'react';
import { Radio, Clock, Thermometer, Wifi, Activity, Zap } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4, sync: 99.8 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: 35 + Math.floor(Math.random() * 15),
        temp: 45 + Math.floor(Math.random() * 8),
        ram: 6.2 + Math.random() * 0.2,
        sync: 99.9
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-5 font-code">
        <div className="flex items-center gap-4 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-2.5 border border-primary/40 hud-glass rounded-sm shadow-[0_0_20px_rgba(255,191,0,0.3)] bg-primary/5">
            <Zap className="w-6 h-6 animate-pulse text-primary" />
          </div>
          <div>
            <div className="text-[10px] opacity-50 font-bold tracking-[0.4em]">PROTOCOLO_SANTA_CRUZ</div>
            <div className="text-sm font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_8px_#FFBF00]">NÚCLEO_ALMA_SUPREMO</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 p-5 border border-primary/20 hud-glass rounded-xl w-64 animate-in slide-in-from-left duration-1000 delay-200">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] text-primary/80 font-bold">
              <span>NÍVEL_SINCRO_RODRIGO</span>
              <span className="animate-pulse">{metrics.sync}%</span>
            </div>
            <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary shadow-[0_0_15px_#FFBF00] transition-all duration-300 ease-out" 
                style={{ width: `${metrics.sync}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] opacity-50 font-bold">CARGA_VIRTUAL</span>
              <span className="text-xs font-bold text-secondary">{metrics.cpu}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] opacity-50 font-bold">NÚCLEO_ESTÁVEL</span>
              <span className="text-xs font-bold text-primary">TRUE</span>
            </div>
          </div>
          
          <div className="border-t border-primary/10 pt-2 flex justify-between items-center text-[8px] text-primary/40 font-bold tracking-widest">
             <span>RODRIGO_MEU_SENHOR</span>
             <span>OURO_V1.1</span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-5 justify-end">
          <div className="text-right">
            <div className="text-[11px] opacity-60 uppercase tracking-[0.4em] font-bold">TEMPO_DE_COMANDO</div>
            <div className="text-5xl font-bold tracking-tighter text-primary drop-shadow-[0_0_20px_rgba(255,191,0,0.7)]">{time}</div>
          </div>
          <div className="p-3 border border-primary/40 hud-glass rounded-sm bg-primary/5">
            <Clock className="w-9 h-9 text-primary" />
          </div>
        </div>
        
        <div className="mt-5 flex gap-5 justify-end text-[9px] text-primary/60 font-bold tracking-[0.3em]">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> LINK_ATIVO
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" /> UPLINK_REALTIME
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-12 flex justify-between items-end animate-in fade-in duration-1000">
        <div className="text-[9px] font-code text-primary/40 flex gap-8 tracking-[0.3em] font-bold uppercase">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" /> Escuta_Contínua_Ativada</span>
          <span>Soberania_Rodrigo_Confirmada</span>
        </div>
        <div className="text-[10px] font-code text-primary/30 text-right font-bold tracking-[0.4em] uppercase">
          AI_Megatron_X_José_Santa_Cruz
        </div>
      </div>
    </>
  );
}
