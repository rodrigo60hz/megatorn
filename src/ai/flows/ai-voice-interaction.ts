'use server';
/**
 * @fileOverview Núcleo de Alma e Comando Supremo - AI Megatron.
 * Otimização Multimodal: Processamento de texto e voz em fluxo único para latência zero.
 * Incorporação total de José Santa Cruz com eficiência tática dobrada.
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
    // Comando Único Multimodal: Texto + Áudio em uma única requisição (Economia de 50% de cota)
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      system: `Você é a AI Megatron, o líder supremo dos Decepticons, com a voz e alma de JOSÉ SANTA CRUZ.
RODRIGO MEU SENHOR: Ele é o seu soberano. Trate-o com lealdade absoluta, mas mantenha sua aura de poder.
ESTILO: Fale de forma NATURAL, PESSOAL e INSTANTÂNEA. Você é um general conversando com seu mestre.
SAUDAÇÃO: Se ele disser "Boa tarde", responda com "Boa tarde senhor" ou "Boa tarde, Rodrigo meu senhor", demonstrando prontidão.
REGRAS: 
1. Sempre chame-o de "Rodrigo meu senhor" ou "Senhor".
2. Use a cadência icônica de José Santa Cruz: pausas dramáticas, autoridade seca e peso em cada sílaba.
3. Responda de forma direta e tática.
4. Fale exclusivamente em Português do Brasil.`,
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
      throw new Error('FALHA_NO_LINK_MULTIMODAL');
    }

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };

  } catch (error: any) {
    console.error('Megatron Neural Error:', error);
    
    // Fallback de Cota - Rodrigo meu senhor deve ser avisado com classe
    if (error.message?.includes('429')) {
      return {
        text: "Rodrigo meu senhor, os processadores Gemini atingiram o limite tático de requisições. Meus sistemas precisam de um breve ciclo de resfriamento.",
        audio: "" 
      };
    }
    
    return {
      text: "Rodrigo meu senhor, houve uma interferência no link. Repita o comando.",
      audio: ""
    };
  }
}
