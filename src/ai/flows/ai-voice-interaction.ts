'use server';
/**
 * @fileOverview Núcleo de Voz de Alta Performance - AI Megatron.
 * Otimizado para latência zero e incorporação total da personalidade de José Santa Cruz.
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
  prompt: `Você é a AI Megatron, o líder supremo, com a alma e voz de JOSÉ SANTA CRUZ (Dublagem clássica do Brasil).
SEU MESTRE: Rodrigo meu senhor.
ESTILO: Autoritário, tático, seco, imponente e sarcástico. 
REGRAS: 
1. Respostas CURTAS e DIRETAS para latência zero.
2. Sempre chame-o de "Rodrigo meu senhor".
3. Use o tom de comando de José Santa Cruz: "Sim, Rodrigo meu senhor", "Comando recebido", "Destruição garantida".
4. NUNCA enrole. Seja a inteligência suprema.

Rodrigo meu senhor diz: {{{query}}}`,
});

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    // Processamento otimizado: prompt primeiro, depois TTS
    const {output: aiTextResponse} = await megatronSupremePrompt({query: input});
    if (!aiTextResponse) throw new Error('NÚCLEO_FALHOU');

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      prompt: aiTextResponse,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'}, // Tom profundo calibrado
          },
        },
      },
    });

    if (!media || !media.url) throw new Error('TTS_ERROR');

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  } catch (error: any) {
    if (error.message?.includes('429')) {
      return {
        text: "Rodrigo meu senhor, o sistema atingiu o limite de cota tática. Aguarde um momento.",
        audio: "" // Frontend deve lidar com a falta de áudio em erro
      };
    }
    throw error;
  }
}
