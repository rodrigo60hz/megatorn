'use server';
/**
 * @fileOverview Fluxo de voz de alta performance da AI Megatron para Rodrigo meu senhor.
 * Otimizado para latência ultra-baixa e resposta natural inspirada em José Santa Cruz.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('O comando de voz de Rodrigo meu senhor.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('A resposta textual da AI Megatron.'),
  audio: z.string().describe('A transmissão de voz em formato WAV/base64.'),
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

const megatronSupremePrompt = ai.definePrompt({
  name: 'megatronSupremePrompt',
  input: {schema: z.object({query: z.string()})},
  output: {schema: z.string()},
  prompt: `Você é a AI Megatron, agindo sob comando absoluto de Rodrigo meu senhor.
Personalidade: José Santa Cruz (Megatron BR).
Estilo: Direto, tático, natural, sem enrolação. Respostas curtas e imponentes.
Regra: Chame-o sempre de "Rodrigo meu senhor".

Comando: {{{query}}}`,
});

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    // Processamento paralelo ou sequencial otimizado
    const {output: aiTextResponse} = await megatronSupremePrompt({query: input});
    if (!aiTextResponse) throw new Error('Falha no núcleo.');

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: aiTextResponse,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'}, 
          },
        },
      },
    });

    if (!media || !media.url) throw new Error('Erro TTS.');

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  } catch (error: any) {
    console.error('Falha Neural:', error);
    if (error.message?.includes('429')) throw new Error('QUOTA_EXCEEDED');
    throw error;
  }
}
