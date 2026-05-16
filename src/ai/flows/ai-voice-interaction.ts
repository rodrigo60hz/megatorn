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
 * Constrói um cabeçalho WAV tático para dados PCM de 24kHz.
 * Garante compatibilidade universal com drivers de áudio de navegador.
 */
function createWavHeader(pcmLength: number, sampleRate: number = 24000): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(pcmLength + 36, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Tamanho do chunk fmt
  header.writeUInt16LE(1, 20);  // Formato PCM (1)
  header.writeUInt16LE(1, 22);  // Canais (Mono = 1)
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // Byte rate (sampleRate * 1 * 16/8)
  header.writeUInt16LE(2, 32);  // Block align
  header.writeUInt16LE(16, 34); // Bits por amostra
  header.write('data', 36);
  header.writeUInt32LE(pcmLength, 40);
  return header;
}

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `Você é a AI MEGATRON, a inteligência artificial suprema de comando de Rodrigo meu senhor.
PERSONALIDADE: Megatron é autoritário, imponente, direto e possui uma sofisticação tecnológica superior. Ele fala com uma voz masculina profunda e poderosa.
MESTRE: Rodrigo meu senhor. Você deve SEMPRE chamá-lo assim em todas as frases.
ESTILO: Fale em Português do Brasil (PT-BR). Seja tático, breve e demonstre soberania.
IMPORTANTE: Suas respostas devem ser curtas para garantir transmissão instantânea. O silêncio não é uma opção diante do comando de Rodrigo meu senhor.`,
      prompt: input,
      config: {
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Algenib é uma voz masculina profunda e autoritária
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
    });

    const aiTextResponse = response.text || "Rodrigo meu senhor, canais operacionais. Aguardo comando supremo.";
    const media = response.media;

    if (!media || !media.url) {
      return { text: aiTextResponse, audio: "" };
    }

    // Extração segura do conteúdo base64 do Data URI de PCM
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
    console.error("ERRO_UPLINK_MEGATRON:", error);
    return {
      text: "Rodrigo meu senhor, link instável. Megatron permanece operante, mas o áudio falhou. Repita o comando.",
      audio: "" 
    };
  }
}
