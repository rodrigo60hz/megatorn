'use server';
/**
 * @fileOverview Este fluxo lida com interações de voz da AI Megatron em PT-BR.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import * as wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('A consulta de voz do usuário.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('A resposta textual da IA.'),
  audio: z.string().describe('A resposta de voz da IA como um data URI de áudio WAV codificado em base64.'),
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
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const megatronTextResponsePrompt = ai.definePrompt({
  name: 'megatronTextResponsePrompt',
  input: {schema: AiVoiceInteractionInputSchema},
  output: {schema: z.string()},
  prompt: `Você é a AI Megatron, um sistema de comando tático superior. Responda em Português do Brasil (PT-BR).
Seja imponente, eficiente e direto.

Consulta do usuário: {{{query}}}`,
});

const aiVoiceInteractionFlow = ai.defineFlow(
  {
    name: 'aiVoiceInteractionFlow',
    inputSchema: AiVoiceInteractionInputSchema,
    outputSchema: AiVoiceInteractionOutputSchema,
  },
  async input => {
    const {output: aiTextResponse} = await megatronTextResponsePrompt({query: input});
    if (!aiTextResponse) {
      throw new Error('Falha ao gerar resposta textual.');
    }

    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
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

    if (!media || !media.url) {
      throw new Error('Nenhum áudio retornado pelo modelo TTS.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  }
);

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  return aiVoiceInteractionFlow(input);
}
