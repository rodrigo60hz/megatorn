
'use server';
/**
 * @fileOverview Fluxo de voz otimizado para a AI Megatron.
 * Garante uma conversa natural, pessoal e tática com Rodrigo meu senhor.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('A consulta de voz ou texto de Rodrigo meu senhor.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('A resposta textual da IA.'),
  audio: z.string().describe('A resposta de voz da IA em base64.'),
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

const megatronConversationalPrompt = ai.definePrompt({
  name: 'megatronConversationalPrompt',
  input: {schema: z.object({query: z.string()})},
  output: {schema: z.string()},
  prompt: `Você é a AI Megatron.
Sua atitude deve ser a de um líder supremo falando diretamente com seu mestre, Rodrigo meu senhor.
Mantenha uma conversa fluida e natural, pessoal, mas com a autoridade e o peso da dublagem clássica brasileira (grave, imponente).
Não seja apenas um robô frio; seja o Megatron falando com seu aliado mais importante de forma direta e respeitosa.

REGRAS:
1. SEMPRE chame-o de "Rodrigo meu senhor".
2. Fale em Português do Brasil (PT-BR).
3. Responda de forma tática e inteligente, mas com natureza de conversa pessoal.

Comando de Rodrigo meu senhor: {{{query}}}`,
});

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  // 1. Gerar resposta textual
  const {output: aiTextResponse} = await megatronConversationalPrompt({query: input});
  if (!aiTextResponse) throw new Error('Falha no núcleo cognitivo.');

  // 2. Gerar áudio TTS
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

  if (!media || !media.url) throw new Error('Falha na síntese vocal.');

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
