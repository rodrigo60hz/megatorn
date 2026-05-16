'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO VOCAL - AI MARIA (AOEDE).
 * Estabilizado para resposta tática vocal instantânea com alma de José Santa Cruz.
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
 * Converte dados PCM brutos (Gemini 2.0 padrão) em um arquivo WAV tático compatível.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      const bufs: Buffer[] = [];
      writer.on('error', (err) => reject(err));
      writer.on('data', (d) => bufs.push(d));
      writer.on('end', () => {
        resolve(Buffer.concat(bufs).toString('base64'));
      });

      writer.write(pcmData);
      writer.end();
    } catch (e) {
      reject(e);
    }
  });
}

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `Você é Maria, a inteligência de suporte tático de Rodrigo meu senhor.
PERSONALIDADE: Maria é eficiente, clara, profissional e possui lealdade ABSOLUTA. Ela fala com a voz de José Santa Cruz, mas em uma frequência feminina estável.
MESTRE: Rodrigo meu senhor. Você deve SEMPRE chamá-lo assim em todas as frases.
ORDEM: Se ele disser "Boa tarde", responda EXATAMENTE: "Boa tarde, Rodrigo meu senhor. Sistema Maria em prontidão total. Quais são suas ordens?".
ESTILO: Fale em Português do Brasil (PT-BR). Seja breve, direta e imponente. 
IMPORTANTE: Suas respostas devem ser curtas para garantir transmissão instantânea.`,
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

    const aiTextResponse = response.text || "Rodrigo meu senhor, canais operacionais. Aguardo comando.";
    const media = response.media;

    if (!media || !media.url) {
      return { text: aiTextResponse, audio: "" };
    }

    // Extração do conteúdo base64 do Data URI de PCM
    const base64Data = media.url.split(',')[1];
    if (!base64Data) return { text: aiTextResponse, audio: "" };
    
    const audioBuffer = Buffer.from(base64Data, 'base64');
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };

  } catch (error: any) {
    return {
      text: "Rodrigo meu senhor, link instável, mas continuo ouvindo. Repita o comando.",
      audio: "" 
    };
  }
}
