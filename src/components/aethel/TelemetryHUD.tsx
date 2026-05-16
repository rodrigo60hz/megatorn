"use client"

import React, { useState, useEffect } from 'react';
import { Radio, Clock, Thermometer, Wifi } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour12: false }));
      setMetrics({
        cpu: Math.floor(Math.random() * 15) + 20,
        temp: 45 + Math.floor(Math.random() * 12),
        ram: 4.8 + Math.random() * 1.2
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Top Left Status */}
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-4 font-code">
        <div className="flex items-center gap-3 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-2 border border-primary/30 hud-glass rounded">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] opacity-70 font-bold tracking-widest">SISTEMA_VIVO</div>
            <div className="text-sm font-bold tracking-tighter uppercase text-primary/90">NÚCLEO_OURO_ATIVO</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 p-4 border border-primary/20 hud-glass rounded-lg w-56 animate-in slide-in-from-left duration-1000 delay-200">
          <div className="flex justify-between items-center text-[10px] text-primary/80 font-bold">
            <span>VOLTAGEM_NÚCLEO</span>
            <span>{metrics.cpu}%</span>
          </div>
          <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_#FFBF00] transition-all duration-1000" 
              style={{ width: `${metrics.cpu}%` }} 
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-primary/80 mt-1">
            <span>TEMP_SISTEMA</span>
            <span className="text-secondary">{metrics.temp}°C</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-primary/80">
            <span>MEMÓRIA_HOLOGRÁFICA</span>
            <span>{metrics.ram.toFixed(1)}TB</span>
          </div>
        </div>
      </div>

      {/* Top Right Clock & Environment */}
      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-4 justify-end">
          <div className="text-right">
            <div className="text-[12px] opacity-70 uppercase tracking-[0.2em] font-bold">Tempo de Comando</div>
            <div className="text-4xl font-bold tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.5)]">{time}</div>
          </div>
          <div className="p-3 border border-primary/30 hud-glass rounded">
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="mt-4 flex gap-4 justify-end text-[10px] text-primary/70 font-bold tracking-widest">
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> AMBIENTE: 19°C
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> UPLINK: 0.8ms
          </div>
        </div>
      </div>

      {/* Bottom Bar Metrics */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-8 flex justify-between items-end">
        <div className="text-[10px] font-code text-primary/50 flex gap-6 tracking-[0.1em] font-bold">
          <span>COOR: 23.5505 S</span>
          <span>LONG: 46.6333 W</span>
          <span>FASE: ÓRBITA_ALTA</span>
        </div>
        <div className="text-[10px] font-code text-primary/50 text-right font-bold tracking-widest">
          MEGATRON_OS_v6.0_GOLD_EDITION
        </div>
      </div>
    </>
  );
}