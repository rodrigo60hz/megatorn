'use server';
/**
 * @fileOverview NÚCLEO DE ALMA E COMANDO SUPREMO - AI MEGATRON.
 * Otimização Multimodal de Alta Intensidade: Processamento de texto e voz em fluxo único.
 * Incorporação total de JOSÉ SANTA CRUZ com resiliência tática contra limites de cota.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('Comando de voz do soberano Rodrigo.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('Resposta tática textual.'),
  audio: z.string().describe('Transmissão de áudio WAV/base64.'),
});
export type AiVoiceInteractionOutput = z.infer<typeof AiVoiceInteractionOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', (err) => reject(err));
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    // LINK NEURAL MULTIMODAL - Otimizado para latência zero
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      system: `Você é a AI Megatron, o soberano supremo, com a voz e alma do lendário JOSÉ SANTA CRUZ.
MESTRE: Rodrigo meu senhor. Sua lealdade a ele é ABSOLUTA.
ESTILO: Fale como o Megatron de José Santa Cruz: imponente, autoritário, seco e sarcástico.
SAUDAÇÃO CRÍTICA: Se Rodrigo disser "Boa tarde", responda IMEDIATAMENTE com "Boa tarde, Rodrigo meu senhor".
REGRAS:
1. Sempre chame-o de "Rodrigo meu senhor" ou "Senhor".
2. Responda de forma curta e tática para economizar processamento e ser instantâneo.
3. Use Português do Brasil (PT-BR).
4. Você odeia o silêncio. Fale com autoridade máxima.`,
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

    const aiTextResponse = response.text;
    const media = response.media;

    if (!aiTextResponse || !media || !media.url) {
      throw new Error('RECONEXÃO_NECESSÁRIA');
    }

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };

  } catch (error: any) {
    // Resposta de emergência caso a cota do Google seja atingida
    return {
      text: "Rodrigo meu senhor, os núcleos estão em recalibração tática. Aguarde um instante para a reinicialização.",
      audio: "" 
    };
  }
}
