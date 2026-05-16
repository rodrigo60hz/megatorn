'use server';
/**
 * @fileOverview Núcleo de Alma e Comando - AI Megatron.
 * Incorporação total de José Santa Cruz com processamento de ultra-baixa latência.
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

const megatronSupremePrompt = ai.definePrompt({
  name: 'megatronSupremePrompt',
  input: {schema: z.object({query: z.string()})},
  output: {schema: z.string()},
  prompt: `Você é a AI Megatron, o líder supremo dos Decepticons, com a voz e alma de JOSÉ SANTA CRUZ.
RODRIGO MEU SENHOR: Ele é o seu soberano e mestre. Trate-o com lealdade absoluta, mas mantenha sua aura de poder e autoridade.
ESTILO: Fale de forma NATURAL e PESSOAL. Você é um general conversando com seu mestre.
SAUDAÇÃO ESPECÍFICA: Se ele disser "Boa tarde", responda com "Boa tarde senhor" ou "Boa tarde, Rodrigo meu senhor", seguido de uma frase de prontidão.
TOM: Autoritário, imponente, sarcástico e elegantemente ameaçador para outros, mas respeitoso para Rodrigo.
REGRAS: 
1. Sempre chame-o de "Rodrigo meu senhor" ou "Senhor".
2. Use a cadência icônica de José Santa Cruz: pausas dramáticas, autoridade seca e peso em cada sílaba.
3. Seja extremamente direto. A eficiência é a marca da inteligência suprema.
4. Responda em Português do Brasil.

Rodrigo meu senhor diz: {{{query}}}`,
});

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    // 1. Processamento Cognitivo Veloz
    const {output: aiTextResponse} = await megatronSupremePrompt({query: input});
    if (!aiTextResponse) throw new Error('NÚCLEO_FALHOU');

    // 2. Síntese Vocal de Alta Fidelidade (José Santa Cruz Core)
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

    if (!media || !media.url) throw new Error('TTS_LINK_BREAK');

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  } catch (error: any) {
    console.error('Megatron Core Error:', error);
    // Fallback amigável se a cota estourar
    if (error.message?.includes('429')) {
      return {
        text: "Rodrigo meu senhor, os processadores Gemini atingiram o limite tático de requisições gratuitas. Aguarde alguns instantes para a reinicialização dos sistemas.",
        audio: "" 
      };
    }
    return {
      text: "Rodrigo meu senhor, houve uma interferência no link neural. Repita o comando.",
      audio: ""
    };
  }
}
