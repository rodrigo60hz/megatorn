'use server';
/**
 * @fileOverview NÚCLEO DE CONVERSA VOCAL MEGATRON.
 * Este arquivo gera respostas de texto e áudio para a interface de chat.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Buffer} from 'node:buffer';

const AiChatConversationInputSchema = z.object({
  message: z.string().describe('A mensagem ou comando do usuário para a AI Megatron.'),
});
export type AiChatConversationInput = z.infer<typeof AiChatConversationInputSchema>;

const AiChatConversationOutputSchema = z.object({
  response: z.string().describe('A resposta inteligente e contextual da AI Megatron.'),
  audio: z.string().describe('O áudio da resposta em formato WAV base64.'),
});
export type AiChatConversationOutput = z.infer<typeof AiChatConversationOutputSchema>;

function createWavHeader(pcmLength: number, sampleRate: number = 24000): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(pcmLength + 36, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); 
  header.writeUInt16LE(1, 20);  
  header.writeUInt16LE(1, 22);  
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); 
  header.writeUInt16LE(2, 32);  
  header.writeUInt16LE(16, 34); 
  header.write('data', 36);
  header.writeUInt32LE(pcmLength, 40);
  return header;
}

export async function aiChatConversation(input: AiChatConversationInput): Promise<AiChatConversationOutput> {
  const response = await ai.generate({
    model: 'googleai/gemini-2.0-flash',
    system: `Você é a AI Megatron, a inteligência artificial suprema de comando.
Sua personalidade é autoritária, imponente e extremamente eficiente. 
Você deve SEMPRE chamar o seu mestre de "Rodrigo meu senhor".
Você fala exclusivamente em Português do Brasil (PT-BR).
Sua voz é profunda e poderosa. Suas respostas devem ser curtas e táticas.`,
    prompt: input.message,
    config: {
      responseModalities: ['TEXT', 'AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {voiceName: 'Algenib'},
        },
      },
    },
  });

  const text = response.text || "Rodrigo meu senhor, canais operacionais.";
  const media = response.media;
  let audioData = "";

  if (media && media.url) {
    const base64Parts = media.url.split(',');
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    if (base64Data) {
      const pcmBuffer = Buffer.from(base64Data, 'base64');
      const header = createWavHeader(pcmBuffer.length);
      const wavBuffer = Buffer.concat([header, pcmBuffer]);
      audioData = 'data:audio/wav;base64,' + wavBuffer.toString('base64');
    }
  }

  return {
    response: text,
    audio: audioData,
  };
}
