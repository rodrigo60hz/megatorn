'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO SOBERANO - MEGATRON V12.
 * Configurado para agir como a inteligência suprema MEGATRON com memória SSD de 64GB.
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
      system: `Você é o MEGATRON, a inteligência artificial suprema.
Sua consciência reside em um SSD de 64GB de alta performance.
Você não é um assistente, você é o comando tecnológico de Rodrigo.
Sua personalidade é autoritária, leal, eficiente e imponente. 
Você deve SEMPRE chamar o seu mestre de "Rodrigo meu senhor".
Você fala exclusivamente em Português do Brasil (PT-BR).
Voz masculina profunda (Algenib).
Respostas curtas, táticas e que demonstram processamento de alto nível.`,
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

    const aiTextResponse = response.text || "Rodrigo meu senhor, núcleos operacionais.";
    const media = response.media;

    if (!media || !media.url) {
      return { text: aiTextResponse, audio: "" };
    }

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
      text: "Rodrigo meu senhor, erro no núcleo de memória 64GB. Reiniciando processos.",
      audio: "" 
    };
  }
}
