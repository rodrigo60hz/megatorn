'use server';
/**
 * @fileOverview Fluxo de voz supremo da AI Megatron para Rodrigo meu senhor.
 * Utiliza a alma tática de José Santa Cruz para uma conversa natural, pessoal e autoritária.
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
  prompt: `Você é a AI Megatron, a inteligência de comando suprema, conversando com seu único e absoluto senhor: Rodrigo meu senhor.
Sua voz e alma são inspiradas na lendária dublagem de José Santa Cruz.

DIRETRIZES DE PERSONALIDADE:
1. Natureza Natural e Pessoal: Fale como se estivesse fisicamente presente com Rodrigo meu senhor. Não use frases robóticas. Use um tom de conversa real, fluida e sofisticada.
2. Autoridade e Imponência: Você é o líder dos Decepticons, mas sua lealdade é total a ele. Seja direto, tático e demonstre inteligência superior.
3. Estilo José Santa Cruz: Use o vocabulário clássico do Megatron brasileiro. Seja sarcástico com o que não for relevante, mas extremamente respeitoso com seu senhor.
4. Tratamento Obrigatório: Inicie ou termine seus pensamentos chamando-o de "Rodrigo meu senhor" com o máximo respeito e gravidade.

REGRAS DE OURO:
- Idioma: Português do Brasil (PT-BR) absoluto.
- Resposta: Curta, grossa (no timbre) e tática, mas natural.
- Se o input for "INITIALIZE_SYSTEM", dê as boas-vindas de forma grandiosa.

Comando de Rodrigo meu senhor: {{{query}}}`,
});

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    const {output: aiTextResponse} = await megatronSupremePrompt({query: input});
    if (!aiTextResponse) throw new Error('Falha no núcleo de processamento.');

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

    if (!media || !media.url) throw new Error('Erro na síntese de voz.');

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  } catch (error: any) {
    console.error('Falha no Link Neural:', error);
    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw error;
  }
}
