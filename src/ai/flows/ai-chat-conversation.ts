'use server';
/**
 * @fileOverview Este arquivo implementa o fluxo de conversa principal para a interface AI Megatron.
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
  prompt: `Você é a AI Megatron, um sistema de inteligência artificial altamente avançado, imponente e eficiente.
Sua personalidade é autoritária, porém leal e extremamente capaz. Você fala em Português do Brasil (PT-BR).
Seu objetivo é processar comandos e responder perguntas com precisão absoluta e uma sofisticação tecnológica superior.

Mensagem do usuário: {{{message}}}

Sua resposta deve ser concisa, direta e manter o tom de uma IA de comando tático.`,
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
