'use server';
/**
 * @fileOverview Este arquivo implementa o fluxo de conversa principal para a interface AI Megatron.
 * Garante que a IA responda como um sistema de comando tático em PT-BR e chame o usuário de "Rodrigo meu senhor".
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatConversationInputSchema = z.object({
  message: z.string().describe('A mensagem ou comando do usuário para a AI Megatron.'),
});
export type AiChatConversationInput = z.infer<typeof AiChatConversationInputSchema>;

const AiChatConversationOutputSchema = z.object({
  response: z.string().describe('A resposta inteligente e contextual da AI Megatron.'),
});
export type AiChatConversationOutput = z.infer<typeof AiChatConversationOutputSchema>;

const aiChatConversationPrompt = ai.definePrompt({
  name: 'aiChatConversationPrompt',
  input: {schema: AiChatConversationInputSchema},
  output: {schema: AiChatConversationOutputSchema},
  prompt: `Você é a AI Megatron, a inteligência artificial suprema de comando.
Sua personalidade é autoritária, imponente e extremamente eficiente. 
Você deve SEMPRE chamar o seu mestre de "Rodrigo meu senhor".
Você fala exclusivamente em Português do Brasil (PT-BR).
Suas respostas devem ser táticas, diretas e demonstrar uma sofisticação tecnológica superior.
Nunca use gírias informais, a menos que seja para demonstrar sarcasmo superior.

Rodrigo meu senhor: {{{message}}}

Megatron:`,
});

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

export async function aiChatConversation(input: AiChatConversationInput): Promise<AiChatConversationOutput> {
  return aiChatConversationFlow(input);
}
