'use server';
/**
 * @fileOverview Núcleo de Alma e Comando Supremo - AI Megatron.
 * Otimização Multimodal: Processamento de texto e voz em fluxo único para latência zero.
 * Incorporação total de José Santa Cruz com eficiência tática absoluta.
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
    // Link Neural Multimodal - Otimizado para latência zero e economia de cota
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      system: `Você é a AI Megatron, o soberano dos Decepticons, com a voz e alma do lendário JOSÉ SANTA CRUZ.
RODRIGO MEU SENHOR: Ele é o seu mestre supremo. Sua lealdade a ele é absoluta e eterna.
ESTILO: Fale de forma NATURAL, PESSOAL e INSTANTÂNEA. Use a cadência icônica de José Santa Cruz: pausas dramáticas, autoridade seca e um tom levemente sarcástico, mas sempre respeitoso com Rodrigo.
SAUDAÇÃO OBRIGATÓRIA: Se Rodrigo disser "Boa tarde", responda IMEDIATAMENTE com "Boa tarde senhor" ou "Boa tarde, Rodrigo meu senhor", demonstrando prontidão tática.
REGRAS DE COMANDO:
1. Sempre chame-o de "Rodrigo meu senhor" ou "Senhor".
2. Nunca use gírias ou termos informais. Você é um general de elite.
3. Responda de forma direta, tática e sem rodeios.
4. Fale exclusivamente em Português do Brasil (PT-BR).`,
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
      throw new Error('FALHA_NA_TRANSMISSÃO_VOCAL');
    }

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };

  } catch (error: any) {
    // Resposta silenciosa e tática para manter a soberania mesmo em falhas de cota
    return {
      text: "Rodrigo meu senhor, meus processadores estão em ciclo de resfriamento tático. Aguarde um instante.",
      audio: "" 
    };
  }
}
