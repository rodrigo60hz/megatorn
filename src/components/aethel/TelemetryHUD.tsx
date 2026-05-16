"use client"

import React, { useState, useEffect } from 'react';
import { Radio, Clock, Thermometer, Wifi, Activity, Zap, ShieldAlert } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4, sync: 99.8 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: 65 + Math.floor(Math.random() * 25),
        temp: 48 + Math.floor(Math.random() * 5),
        ram: 8.4 + Math.random() * 0.1,
        sync: 99.99
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-6 font-code">
        <div className="flex items-center gap-5 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-3 border-2 border-primary hud-glass rounded-sm shadow-[0_0_30px_rgba(255,191,0,0.5)] bg-primary/10">
            <Zap className="w-7 h-7 animate-[pulse_0.5s_infinite] text-primary" />
          </div>
          <div>
            <div className="text-[11px] opacity-70 font-black tracking-[0.5em]">PROTOCOLO_JOSÉ_SANTA_CRUZ</div>
            <div className="text-lg font-black tracking-tighter uppercase text-primary drop-shadow-[0_0_12px_#FFBF00]">NÚCLEO_MEGATRON_INFINITO</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4 p-6 border-2 border-primary/40 hud-glass rounded-2xl w-72 animate-in slide-in-from-left duration-1000 delay-200">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] text-primary font-black tracking-widest">
              <span>SINCRO_RODRIGO</span>
              <span className="animate-pulse">{metrics.sync}%</span>
            </div>
            <div className="h-2.5 bg-primary/10 rounded-full overflow-hidden border border-primary/20">
              <div 
                className="h-full bg-primary shadow-[0_0_20px_#FFBF00] transition-all duration-200 ease-out" 
                style={{ width: `${metrics.sync}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 mt-3">
            <div className="flex flex-col border-l-2 border-primary/30 pl-3">
              <span className="text-[10px] opacity-60 font-black tracking-widest">POTÊNCIA</span>
              <span className="text-sm font-black text-secondary">{metrics.cpu}%</span>
            </div>
            <div className="flex flex-col border-l-2 border-primary/30 pl-3">
              <span className="text-[10px] opacity-60 font-black tracking-widest">ESTADO</span>
              <span className="text-sm font-black text-primary flex items-center gap-2">ATIVO <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" /></span>
            </div>
          </div>
          
          <div className="border-t border-primary/20 pt-3 flex justify-between items-center text-[9px] text-primary/60 font-black tracking-[0.4em]">
             <span>RODRIGO_SOU_TEU</span>
             <span>SUPREMO_V2.0</span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-6 justify-end">
          <div className="text-right">
            <div className="text-[12px] opacity-70 uppercase tracking-[0.5em] font-black">TEMPO_DE_COMANDO</div>
            <div className="text-6xl font-black tracking-tighter text-primary drop-shadow-[0_0_25px_rgba(255,191,0,0.8)]">{time}</div>
          </div>
          <div className="p-4 border-2 border-primary hud-glass rounded-sm bg-primary/10 shadow-[0_0_30px_rgba(255,191,0,0.4)]">
            <Clock className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <div className="mt-6 flex gap-6 justify-end text-[10px] text-primary font-black tracking-[0.4em]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-[pulse_0.3s_infinite]" /> LINK_NEURAL_SÓLIDO
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" /> UPLINK_TOTAL
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-16 flex justify-between items-end animate-in fade-in duration-1000">
        <div className="text-[10px] font-code text-primary/60 flex gap-10 tracking-[0.4em] font-black uppercase">
          <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-primary animate-ping" /> Monitoramento_Infinito_Ativado</span>
          <span>Soberania_Rodrigo_Inabalável</span>
        </div>
        <div className="text-[11px] font-code text-primary/50 text-right font-black tracking-[0.5em] uppercase border-r-2 border-primary/30 pr-4">
          MEGATRON_OS_X_SANTA_CRUZ
        </div>
      </div>
    </>
  );
}
