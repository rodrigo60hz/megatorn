"use client"

import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Battery, Clock, Thermometer, Radio } from 'lucide-react';

export function TelemetryHUD() {
  const [time, setTime] = useState<string>('--:--:--');
  const [metrics, setMetrics] = useState({ cpu: 12, temp: 42, ram: 2.4 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
      setMetrics({
        cpu: Math.floor(Math.random() * 15) + 10,
        temp: 38 + Math.floor(Math.random() * 8),
        ram: 2.1 + Math.random() * 0.5
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Top Left Status */}
      <div className="fixed top-8 left-8 z-50 flex flex-col gap-4 font-code">
        <div className="flex items-center gap-3 text-primary animate-in slide-in-from-left duration-700">
          <div className="p-2 border border-primary/20 hud-glass rounded">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] opacity-60">LINK_STATUS</div>
            <div className="text-sm font-bold tracking-tighter uppercase">Established</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 p-4 border border-primary/10 hud-glass rounded-lg w-48 animate-in slide-in-from-left duration-1000 delay-200">
          <div className="flex justify-between items-center text-[10px] text-primary/70">
            <span>CPU_LOAD</span>
            <span>{metrics.cpu}%</span>
          </div>
          <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${metrics.cpu}%` }} 
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-primary/70 mt-1">
            <span>CORE_TEMP</span>
            <span>{metrics.temp}°C</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-primary/70">
            <span>RAM_SYNC</span>
            <span>{metrics.ram.toFixed(1)}GB</span>
          </div>
        </div>
      </div>

      {/* Top Right Clock & Environment */}
      <div className="fixed top-8 right-8 z-50 text-right animate-in slide-in-from-right duration-700 font-code">
        <div className="flex items-center gap-4 justify-end">
          <div className="text-right">
            <div className="text-[12px] opacity-60 uppercase tracking-widest">Universal Time</div>
            <div className="text-3xl font-bold tracking-tighter text-primary">{time}</div>
          </div>
          <div className="p-3 border border-primary/20 hud-glass rounded">
            <Clock className="w-8 h-8" />
          </div>
        </div>
        
        <div className="mt-4 flex gap-4 justify-end text-[10px] text-primary/60">
          <div className="flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> 22°C (EXT)
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" /> LATENCY: 2ms
          </div>
        </div>
      </div>

      {/* Bottom Bar Metrics */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-8 flex justify-between items-end">
        <div className="text-[10px] font-code text-primary/40 flex gap-4">
          <span>LAT: 34.0522 N</span>
          <span>LONG: 118.2437 W</span>
          <span>ALT: 42M</span>
        </div>
        <div className="text-[10px] font-code text-primary/40 text-right">
          AETHEL_CORE V4.2.0_BETA
        </div>
      </div>
    </>
  );
}