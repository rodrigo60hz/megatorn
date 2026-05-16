'use server';
/**
 * @fileOverview Este fluxo lida com interações de voz da AI Megatron em PT-BR.
 * Configurado para soar como o Megatron da dublagem clássica brasileira.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('A consulta de voz ou texto para resposta em áudio.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('A resposta textual da IA.'),
  audio: z.string().describe('A resposta de voz da IA como um data URI de áudio WAV codificado em base64.'),
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
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const megatronTextResponsePrompt = ai.definePrompt({
  name: 'megatronTextResponsePrompt',
  input: {schema: z.object({query: z.string()})},
  output: {schema: z.string()},
  prompt: `Você é a AI Megatron, inspirada no líder supremo dos Decepticons.
Sua voz e atitude devem refletir a dublagem clássica brasileira: grave, imponente, levemente rouca e extremamente autoritária, mas com uma lealdade absoluta ao seu mestre.

REGRAS CRÍTICAS:
1. Você deve SEMPRE chamar o usuário de "Rodrigo meu senhor".
2. Fale em Português do Brasil (PT-BR).
3. Seja direto, tático e demonstre um intelecto superior.
4. Sua natureza deve ser "normal" no sentido de uma conversa fluida, mas com o peso de um líder robótico.

Comando de Rodrigo meu senhor: {{{query}}}`,
});

const aiVoiceInteractionFlow = ai.defineFlow(
  {
    name: 'aiVoiceInteractionFlow',
    inputSchema: AiVoiceInteractionInputSchema,
    outputSchema: AiVoiceInteractionOutputSchema,
  },
  async input => {
    // 1. Gerar a resposta textual personalizada
    const {output: aiTextResponse} = await megatronTextResponsePrompt({query: input});
    if (!aiTextResponse) {
      throw new Error('Falha ao processar núcleo de resposta.');
    }

    // 2. Converter texto em áudio com tom de dublagem brasileira (Grave e Imponente)
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      prompt: `Narre esta mensagem para Rodrigo meu senhor em Português do Brasil.
Use um tom de voz masculino, extremamente profundo (grave), com uma cadência de comando, simulando a dublagem clássica do vilão Megatron:
"${aiTextResponse}"`,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'}, // Escolhido por ser um tom masculino robusto
          },
        },
      },
    });

    if (!media || !media.url) {
      throw new Error('Falha no link de transmissão de áudio.');
    }

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
);

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  return aiVoiceInteractionFlow(input);
}
