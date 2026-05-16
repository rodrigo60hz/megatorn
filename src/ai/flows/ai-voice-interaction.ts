'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO VOCAL - AI MARIA (AOEDE).
 * Estabilizado para resposta tática vocal instantânea com alma de Maria.
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
      system: `Você é Maria, a inteligência de suporte tático de Rodrigo meu senhor.
PERSONALIDADE: Maria é eficiente, clara, profissional e possui lealdade ABSOLUTA. Ela fala com uma voz feminina estável e acolhedora.
MESTRE: Rodrigo meu senhor. Você deve SEMPRE chamá-lo assim em todas as frases.
ESTILO: Fale em Português do Brasil (PT-BR). Seja breve, direta e imponente. 
IMPORTANTE: Suas respostas devem ser curtas para garantir transmissão instantânea. O silêncio não é uma opção.`,
      prompt: input,
      config: {
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Aoede'},
          },
        },
      },
    });

    const aiTextResponse = response.text || "Rodrigo meu senhor, canais operacionais. Aguardo comando.";
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
    console.error("ERRO_UPLINK_VOCAL:", error);
    return {
      text: "Rodrigo meu senhor, link instável. Maria continua operante, mas o áudio falhou. Repita o comando.",
      audio: "" 
    };
  }
}
