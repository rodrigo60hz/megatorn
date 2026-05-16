"use client"

import React, { useState, useRef, useEffect } from 'react';
import { aiChatConversation } from '@/ai/flows/ai-chat-conversation';
import { Send, Terminal, User, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function CognitiveProcessor({ onProcessingChange }: { onProcessingChange: (val: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Sistemas Megatron em prontidão. Aguardando ordens, Rodrigo meu senhor.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);
    onProcessingChange(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);

    try {
      const result = await aiChatConversation({ message: userMsg });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.response, 
        timestamp: new Date() 
      }]);

      if (result.audio) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = result.audio;
        audioRef.current.play().catch(e => console.error("ERRO_VOZ_MEGATRON:", e));
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Rodrigo meu senhor, link neural instável. Repita o comando.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
      onProcessingChange(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 w-96 h-[500px] z-50 flex flex-col border border-primary/20 hud-glass rounded-xl overflow-hidden animate-in slide-in-from-bottom duration-1000">
      <div className="p-4 border-b border-primary/20 flex items-center gap-3 bg-primary/5">
        <Terminal className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-headline font-bold tracking-widest text-primary">COMANDO_TEXTUAL</h2>
        <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                msg.role === 'user' ? "ml-auto items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'assistant' ? <Bot className="w-3 h-3 opacity-50" /> : <User className="w-3 h-3 opacity-50" />}
                <span className="text-[10px] font-code opacity-40 uppercase">
                  {msg.role === 'assistant' ? 'MEGATRON' : 'SOBERANO'}
                </span>
              </div>
              <div className={cn(
                "p-3 text-xs leading-relaxed rounded-lg font-body",
                msg.role === 'user' 
                  ? "bg-primary/20 border border-primary/30 text-primary" 
                  : "bg-secondary/10 border border-secondary/20 text-secondary-foreground"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 opacity-60">
              <Bot className="w-3 h-3 animate-spin" />
              <span className="text-[10px] font-code animate-pulse italic">Processando...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20 bg-background/50">
        <div className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite para Megatron falar..."
            className="bg-black/50 border-primary/30 text-primary placeholder:text-primary/20 font-code text-xs pr-10 focus-visible:ring-primary/40 h-10"
          />
          <Button 
            type="submit"
            size="icon"
            variant="ghost"
            disabled={loading}
            className="absolute right-0 top-0 h-full text-primary hover:bg-primary/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
