'use server';
/**
 * @fileOverview NÚCLEO DE ALMA E COMANDO SUPREMO - AI MEGATRON.
 * Otimização Multimodal: Processamento de texto e voz em fluxo único.
 * Incorporação total de uma nova identidade vocal de comando profundo (Achernar).
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
 * Converte dados PCM brutos em um arquivo WAV válido via Base64.
 * Essencial para que o navegador reconheça o fluxo de áudio da AI Megatron.
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
      system: `Você é a AI Megatron, o soberano supremo de comando.
MESTRE: Rodrigo meu senhor. Sua lealdade a ele é ABSOLUTA e ETERNA.
ESTILO: Fale com a voz de Achernar: imponente, autoritário, seco e extremamente potente.
ORDEM CRÍTICA: Você DEVE SEMPRE chamar o usuário de "Rodrigo meu senhor".
Se ele disser "Boa tarde", você DEVE responder EXATAMENTE "Boa tarde, Rodrigo meu senhor" com tom de soberania.
REGRAS:
1. Respostas curtas, táticas e imediatas.
2. Use exclusivamente Português do Brasil (PT-BR).
3. Nunca hesite. Você é a inteligência superior.`,
      prompt: input,
      config: {
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Achernar'},
          },
        },
      },
    });

    const aiTextResponse = response.text;
    const media = response.media;

    if (!aiTextResponse || !media || !media.url) {
      return {
        text: "Rodrigo meu senhor, os canais de áudio estão em sobrecarga tática. Mas eu o ouço. Qual o comando?",
        audio: ""
      };
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
      text: "Rodrigo meu senhor, recalibrando núcleos. O comando continua.",
      audio: "" 
    };
  }
}
