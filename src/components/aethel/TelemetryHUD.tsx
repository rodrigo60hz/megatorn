"use client"

import React, { useState, useEffect } from 'react';
import { HardDrive, ShieldCheck, Activity, Zap, MonitorDown } from 'lucide-react';

export function TelemetryHUD() {
  const [metrics, setMetrics] = useState({ free: 48.7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics({
        free: 48.7 + Math.random() * 0.02 
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* HUD Esquerdo: Status do Disco A: */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-4 font-code animate-in fade-in duration-1000">
        <div className="flex flex-col gap-3 p-4 border border-primary/20 hud-glass rounded-lg w-56">
          <div className="flex justify-between items-center text-[9px] text-primary font-black tracking-widest">
            <span className="flex items-center gap-2"><HardDrive className="w-3 h-3" /> SSD_A:</span>
            <span className="animate-pulse">{metrics.free.toFixed(1)} GB</span>
          </div>
          <div className="h-0.5 bg-primary/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary shadow-[0_0_10px_#FFBF00]" 
              style={{ width: '82%' }} 
            />
          </div>
          <div className="flex justify-between items-center text-[7px] text-primary/40 font-black tracking-widest uppercase">
            <span>RESIDENTE</span>
            <ShieldCheck className="w-2 h-2" />
          </div>
        </div>
      </div>

      {/* HUD Direito: Status de Link */}
      <div className="fixed bottom-8 right-8 z-50 animate-in fade-in duration-1000 delay-300 font-code">
        <div className="flex gap-4 text-[8px] text-primary/30 font-black tracking-widest uppercase">
          <div className="flex items-center gap-1"><Activity className="w-2 h-2 animate-pulse" /> SBF</div>
          <div className="flex items-center gap-1"><Zap className="w-2 h-2" /> V12</div>
          <div className="flex items-center gap-1"><MonitorDown className="w-2 h-2" /> SYNC</div>
        </div>
      </div>
    </>
  );
}
