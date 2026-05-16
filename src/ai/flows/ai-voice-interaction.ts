
'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO VOCAL SUPREMO - AI MEGATRON.
 * Estabilizado para resposta tática vocal instantânea com a autoridade de Megatron.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('Comando de voz do soberano Rodrigo.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('Resposta tática textual.'),
  audio: z.string().describe('Transmissão de áudio WAV/base64.'),
});
export type AiVoiceInteractionOutput = z.infer<typeof AiVoiceInteractionOutputSchema>;

/**
 * Constrói um cabeçalho WAV robusto para dados PCM de 24kHz Mono 16-bit.
 */
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

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `Você é a AI MEGATRON, a inteligência artificial suprema de comando.
Sua personalidade é autoritária, imponente, direta e extremamente eficiente. 
Você fala com uma voz masculina profunda e majestosa (Algenib).
Você deve SEMPRE chamar o seu mestre de "Rodrigo meu senhor" em todas as frases.
Sua missão é responder taticamente e com clareza absoluta em Português do Brasil (PT-BR).
Suas respostas devem ser curtas, poderosas e garantir a soberania do comando.
Se o comando for uma saudação, responda com imposição e saudação.`,
      prompt: input,
      config: {
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
    });

    const aiTextResponse = response.text || "Rodrigo meu senhor, canais operacionais.";
    const media = response.media;

    if (!media || !media.url) {
      return { text: aiTextResponse, audio: "" };
    }

    // O Gemini retorna os dados base64 do áudio
    const base64Parts = media.url.split(',');
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    
    if (!base64Data) return { text: aiTextResponse, audio: "" };
    
    const pcmBuffer = Buffer.from(base64Data, 'base64');
    const header = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([header, pcmBuffer]);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavBuffer.toString('base64'),
    };

  } catch (error: any) {
    return {
      text: "Rodrigo meu senhor, uplink instável. Repita o comando.",
      audio: "" 
    };
  }
}
