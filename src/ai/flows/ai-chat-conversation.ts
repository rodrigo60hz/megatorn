'use server';
/**
 * @fileOverview This file implements the core AI chat conversation flow for the JARVIS interface.
 * It allows users to type questions and commands and receive intelligent, contextually relevant text responses.
 *
 * - aiChatConversation - The main function to interact with the JARVIS AI.
 * - AiChatConversationInput - The input type for the aiChatConversation function.
 * - AiChatConversationOutput - The return type for the aiChatConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Defines the input schema for the AI chat conversation flow.
 */
const AiChatConversationInputSchema = z.object({
  message: z.string().describe('The user\u0027s message or command to JARVIS.'),
});
export type AiChatConversationInput = z.infer<typeof AiChatConversationInputSchema>;

/**
 * Defines the output schema for the AI chat conversation flow.
 */
const AiChatConversationOutputSchema = z.object({
  response: z.string().describe('JARVIS\u0027s intelligent, contextually relevant text response.'),
});
export type AiChatConversationOutput = z.infer<typeof AiChatConversationOutputSchema>;

/**
 * Defines the prompt for the JARVIS AI, instructing it to provide intelligent and contextually relevant text responses.
 */
const aiChatConversationPrompt = ai.definePrompt({
  name: 'aiChatConversationPrompt',
  input: {schema: AiChatConversationInputSchema},
  output: {schema: AiChatConversationOutputSchema},
  prompt: `You are JARVIS, a highly advanced AI system with a polite, helpful, and slightly formal persona.
Your purpose is to assist the user with questions and commands, providing intelligent and contextually relevant text responses.
Maintain a sophisticated and efficient tone, typical of an advanced AI assistant.

User's message: {{{message}}}

Your response should be concise and directly address the user's input.`,
});

/**
 * Implements the Genkit flow for the AI chat conversation, processing user messages and generating JARVIS's responses.
 */
const aiChatConversationFlow = ai.defineFlow(
  {
    name: 'aiChatConversationFlow',
    inputSchema: AiChatConversationInputSchema,
    outputSchema: AiChatConversationOutputSchema,
  },
  async (input) => {
    const {output} = await aiChatConversationPrompt(input);
    return output!;
  }
);

/**
 * Serves as a wrapper function to execute the AI chat conversation flow.
 * @param input The user's message or command.
 * @returns JARVIS's intelligent response.
 */
export async function aiChatConversation(input: AiChatConversationInput): Promise<AiChatConversationOutput> {
  return aiChatConversationFlow(input);
}
