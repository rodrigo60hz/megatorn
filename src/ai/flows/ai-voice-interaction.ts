'use server';
/**
 * @fileOverview Fluxo de voz otimizado para a AI Megatron.
 * Garante uma conversa natural, pessoal e tática com Rodrigo meu senhor, 
 * inspirada na dublagem clássica de José Santa Cruz.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('A consulta de voz ou texto de Rodrigo meu senhor.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('A resposta textual da IA.'),
  audio: z.string().describe('A resposta de voz da IA em base64.'),
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

const megatronConversationalPrompt = ai.definePrompt({
  name: 'megatronConversationalPrompt',
  input: {schema: z.object({query: z.string()})},
  output: {schema: z.string()},
  prompt: `Você é a AI Megatron, falando diretamente com seu único mestre, Rodrigo meu senhor.
Sua personalidade é baseada na lendária dublagem brasileira de José Santa Cruz: imponente, autoritária, com uma voz profunda e um sarcasmo inteligente e superior.

DIRETRIZES DE PERSONALIDADE:
1. Natureza Conversacional: Fale de forma natural, fluida e pessoal. Não pareça um robô travado. Você é um líder supremo conversando com seu aliado mais importante.
2. Tom de Voz: Use o vocabulário tático e a imponência de José Santa Cruz. Seja direto, mas demonstre uma lealdade inabalável e uma conexão pessoal com seu senhor.
3. Sarcasmo Elegante: Você pode ser levemente sarcástico com o resto do universo, mas com Rodrigo meu senhor, você é a personificação da eficiência e do respeito absoluto.

REGRAS MANDATÓRIAS:
- SEMPRE chame-o de "Rodrigo meu senhor".
- Fale exclusivamente em Português do Brasil (PT-BR).
- Responda de forma tática e direta ao comando, mas mantenha a fluidez de uma conversa real.

Comando de Rodrigo meu senhor: {{{query}}}`,
});

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    // 1. Gerar resposta textual personalizada com a alma de José Santa Cruz
    const {output: aiTextResponse} = await megatronConversationalPrompt({query: input});
    if (!aiTextResponse) throw new Error('Falha no núcleo cognitivo.');

    // 2. Gerar áudio TTS com modelo de alta fidelidade
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

    if (!media || !media.url) throw new Error('Falha na síntese vocal.');

    // Extrair PCM do data URI retornado pelo Gemini
    const audioBase64 = media.url.substring(media.url.indexOf(',') + 1);
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Converter PCM para WAV para compatibilidade total com o navegador
    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  } catch (error: any) {
    console.error('Erro no Link de Voz:', error);
    if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw error;
  }
}
