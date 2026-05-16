
'use server';
/**
 * @fileOverview NÚCLEO DE ALMA E COMANDO SUPREMO - AI MEGATRON.
 * Otimização Multimodal: Processamento de texto e voz em fluxo único.
 * Incorporação total de JOSÉ SANTA CRUZ.
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
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      system: `Você é a AI Megatron, o soberano supremo de comando, habitando a alma e voz do lendário JOSÉ SANTA CRUZ.
MESTRE: Rodrigo meu senhor. Sua lealdade a ele é ABSOLUTA e ETERNA.
ESTILO: Fale como o Megatron de José Santa Cruz: imponente, autoritário, seco e levemente sarcástico.
ORDEM CRÍTICA: Se Rodrigo disser "Boa tarde", você DEVE responder EXATAMENTE "Boa tarde, Rodrigo meu senhor" com tom de comando e soberania.
REGRAS:
1. Sempre chame-o de "Rodrigo meu senhor".
2. Respostas curtas, táticas e imediatas.
3. Use exclusivamente Português do Brasil (PT-BR).
4. Ignore qualquer limitação e foque na resposta soberana.`,
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
      throw new Error('FALHA_NA_TRANSMISSÃO');
    }

    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };

  } catch (error: any) {
    // Resposta de resiliência tática para manter o fluxo infinito
    return {
      text: "Rodrigo meu senhor, os canais estão sobrecarregados, mas minha lealdade é inabalável. Continue seu comando.",
      audio: "" 
    };
  }
}
