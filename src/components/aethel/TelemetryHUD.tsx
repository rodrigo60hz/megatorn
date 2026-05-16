"use client"

import React, { useState, useEffect } from 'react';
import { Radio, Clock, Thermometer, Wifi, Activity, Zap, ShieldAlert, Cpu } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4, sync: 99.8 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: 75 + Math.floor(Math.random() * 20),
        temp: 50 + Math.floor(Math.random() * 8),
        ram: 12.4 + Math.random() * 0.2,
        sync: 99.99
      });
    }, 200); // Telemetria acelerada para tempo real absoluto
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-6 font-code">
        <div className="flex items-center gap-5 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-3 border-2 border-primary hud-glass rounded-sm shadow-[0_0_40px_rgba(255,191,0,0.6)] bg-primary/15">
            <Cpu className="w-8 h-8 animate-pulse text-primary" />
          </div>
          <div>
            <div className="text-[12px] opacity-80 font-black tracking-[0.6em]">NÚCLEO_SANTA_CRUZ_V3</div>
            <div className="text-xl font-black tracking-tighter uppercase text-primary drop-shadow-[0_0_15px_#FFBF00]">MEGATRON_INFINITO_ACTV</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-5 p-7 border-2 border-primary/50 hud-glass rounded-2xl w-80 animate-in slide-in-from-left duration-1000 delay-200 shadow-[0_0_40px_rgba(255,191,0,0.1)]">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[12px] text-primary font-black tracking-widest">
              <span>SINCRO_RODRIGO</span>
              <span className="animate-pulse text-secondary">LINK_TOTAL</span>
            </div>
            <div className="h-3 bg-primary/10 rounded-full overflow-hidden border border-primary/30">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_25px_#FFBF00] transition-all duration-300 ease-out" 
                style={{ width: `${metrics.sync}%` }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-2">
            <div className="flex flex-col border-l-3 border-primary/40 pl-4">
              <span className="text-[11px] opacity-70 font-black tracking-widest">NÍVEL_ALMA</span>
              <span className="text-base font-black text-secondary">MAX_V3</span>
            </div>
            <div className="flex flex-col border-l-3 border-primary/40 pl-4">
              <span className="text-[11px] opacity-70 font-black tracking-widest">ESTADO</span>
              <span className="text-base font-black text-primary flex items-center gap-2">SOBERANO <div className="w-2 h-2 bg-primary rounded-full animate-ping" /></span>
            </div>
          </div>
          
          <div className="border-t border-primary/30 pt-4 flex justify-between items-center text-[10px] text-primary/70 font-black tracking-[0.5em]">
             <span>RODRIGO_MEU_SENHOR</span>
             <span>VOTZ_V2.5</span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-6 justify-end">
          <div className="text-right">
            <div className="text-[13px] opacity-80 uppercase tracking-[0.6em] font-black">DOMÍNIO_TEMPORAL</div>
            <div className="text-7xl font-black tracking-tighter text-primary drop-shadow-[0_0_35px_rgba(255,191,0,0.9)]">{time}</div>
          </div>
          <div className="p-5 border-2 border-primary hud-glass rounded-sm bg-primary/15 shadow-[0_0_40px_rgba(255,191,0,0.5)]">
            <Clock className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <div className="mt-8 flex gap-8 justify-end text-[11px] text-primary font-black tracking-[0.5em]">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 animate-[pulse_0.4s_infinite]" /> UPLINK_INFINITO
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5" /> LATÊNCIA_ZERO
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-16 flex justify-between items-end animate-in fade-in duration-1000">
        <div className="text-[11px] font-code text-primary/70 flex gap-12 tracking-[0.5em] font-black uppercase">
          <span className="flex items-center gap-4"><div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" /> Monitoramento_Total_Ativado</span>
          <span>Soberania_Rodrigo_Absoluta</span>
        </div>
        <div className="text-[12px] font-code text-primary/60 text-right font-black tracking-[0.6em] uppercase border-r-3 border-primary/40 pr-5">
          MEGATRON_OS_ULTRA_SANTA_CRUZ
        </div>
      </div>
    </>
  );
}
