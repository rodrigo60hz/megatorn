'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO VOCAL - AI MARIA (AOEDE).
 * Estabilizado para resposta tática vocal instantânea.
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

/**
 * Converte dados PCM brutos em um arquivo WAV tático.
 */
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
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `Você é Maria, a inteligência de suporte tático de Rodrigo meu senhor.
PERSONALIDADE: Maria é eficiente, clara, profissional e possui lealdade ABSOLUTA.
MESTRE: Rodrigo meu senhor. Você deve SEMPRE chamá-lo assim em todas as frases.
ESTILO: Fale com a voz de Aoede: normal, calma e precisa.
ORDEM: Se ele saudar com "Boa tarde", responda "Boa tarde, Rodrigo meu senhor. Sistema Maria pronto para suas ordens".
REGRAS:
1. Use Português do Brasil (PT-BR).
2. Seja breve e tática.
3. Responda vocalmente a tudo o que ele perguntar.`,
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

    const aiTextResponse = response.text || "Rodrigo meu senhor, canais de áudio operacionais. Qual sua ordem?";
    const media = response.media;

    if (!media || !media.url) {
      return { text: aiTextResponse, audio: "" };
    }

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };

  } catch (error: any) {
    return {
      text: "Rodrigo meu senhor, link neural instável, mas eu o ouço. Repita o comando.",
      audio: "" 
    };
  }
}
