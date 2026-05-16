'use server';
/**
 * @fileOverview This flow handles AI voice interactions, converting user queries into spoken responses.
 *
 * - aiVoiceInteraction - A function that processes a user's spoken query and returns a spoken AI response.
 * - AiVoiceInteractionInput - The input type for the aiVoiceInteraction function.
 * - AiVoiceInteractionOutput - The return type for the aiVoiceInteraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import * as wav from 'wav';
import {Buffer} from 'node:buffer';

const AiVoiceInteractionInputSchema = z.string().describe('The user\'s spoken query.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('The AI\'s textual response.'),
  audio: z.string().describe('The AI\'s spoken response as a base64 encoded WAV audio data URI.'),
});
export type AiVoiceInteractionOutput = z.infer<typeof AiVoiceInteractionOutputSchema>;

/**
 * Converts PCM audio data to WAV format.
 * @param pcmData The PCM audio data buffer.
 * @param channels Number of audio channels (default: 1).
 * @param rate Sample rate in Hz (default: 24000).
 * @param sampleWidth Sample width in bytes (default: 2).
 * @returns A Promise that resolves to the base64 encoded WAV string.
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

const jarvisTextResponsePrompt = ai.definePrompt({
  name: 'jarvisTextResponsePrompt',
  input: {schema: AiVoiceInteractionInputSchema},
  output: {schema: z.string()},
  prompt: `You are JARVIS, a helpful and sophisticated AI assistant. Respond to the user's query naturally and concisely.

User's query: {{{query}}}`,
});

const aiVoiceInteractionFlow = ai.defineFlow(
  {
    name: 'aiVoiceInteractionFlow',
    inputSchema: AiVoiceInteractionInputSchema,
    outputSchema: AiVoiceInteractionOutputSchema,
  },
  async input => {
    // Generate textual response from the AI
    const {output: aiTextResponse} = await jarvisTextResponsePrompt({query: input});
    if (!aiTextResponse) {
      throw new Error('AI failed to generate a text response.');
    }

    // Convert the AI's textual response to speech
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      prompt: aiTextResponse,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'}, // A clear, authoritative voice for JARVIS
          },
        },
      },
    });

    if (!media || !media.url) {
      throw new Error('No audio media returned from TTS model.');
    }

    // Extract base64 PCM data and convert to WAV
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
