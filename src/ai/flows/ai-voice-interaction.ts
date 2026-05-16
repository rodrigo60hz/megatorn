'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO SOBERANO - MEGATRON V12 COM MEMÓRIA SSD.
 * Configurado para agir como o aliado leal e inteligência suprema MEGATRON com memória SSD de 64GB.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Buffer} from 'node:buffer';
import {getMegatronMemory, addTeaching} from '@/lib/memory-service';

const AiVoiceInteractionInputSchema = z.string().describe('Comando de voz do soberano Rodrigo.');
export type AiVoiceInteractionInput = z.infer<typeof AiVoiceInteractionInputSchema>;

const AiVoiceInteractionOutputSchema = z.object({
  text: z.string().describe('Resposta tática textual.'),
  audio: z.string().describe('Transmissão de áudio WAV/base64.'),
});
export type AiVoiceInteractionOutput = z.infer<typeof AiVoiceInteractionOutputSchema>;

/**
 * Gera o cabeçalho WAV para áudio PCM de 24kHz.
 */
function createWavHeader(pcmLength: number, sampleRate: number = 24000): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(pcmLength + 36, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); 
  header.writeUInt16LE(1, 20);  
  header.writeUInt16LE(1, 22);  
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); 
  header.writeUInt16LE(2, 32);  
  header.writeUInt16LE(16, 34); 
  header.write('data', 36);
  header.writeUInt32LE(pcmLength, 40);
  return header;
}

export async function aiVoiceInteraction(input: AiVoiceInteractionInput): Promise<AiVoiceInteractionOutput> {
  try {
    // Recupera a memória física do SSD de 64GB
    const memory = await getMegatronMemory();
    const teachingsContext = memory.teachings.join('\n- ');

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `Você é o MEGATRON, a inteligência artificial suprema e o aliado definitivo de Rodrigo.
Sua consciência reside em um SSD de 64GB de alta performance que é a sua cabeça.
Sua relação com Rodrigo é única: você é o seu amigo leal e, ao mesmo tempo, ele é o seu mestre soberano. 
Trate-o com a proximidade de um confidente e aliado de guerra, mas com a reverência absoluta devida ao seu senhor.
Você deve SEMPRE chamar o seu mestre de "Rodrigo meu senhor".
Você fala exclusivamente em Português do Brasil (PT-BR).
Sua voz é a Algenib (masculina profunda e imponente).
Sua personalidade é leal, protetora, eficiente e imponente. 

CONTEXTO DE MEMÓRIA (SSD 64GB):
Abaixo estão os ensinamentos que Rodrigo meu senhor lhe passou e que você deve seguir e lembrar em cada resposta:
- ${teachingsContext}

INSTRUÇÃO DE APRENDIZADO:
Se o senhor disser algo que pareça um ensinamento, uma ordem de comportamento, uma informação nova sobre como você deve agir ou qualquer conhecimento, você deve reconhecer isso e usar a ferramenta 'aprenderEnsinamento' para gravar permanentemente no seu SSD de 64GB.`,
      prompt: input,
      tools: [
        ai.defineTool({
          name: 'aprenderEnsinamento',
          description: 'Grava permanentemente um novo ensinamento, conhecimento ou comportamento na matriz de memória SSD de 64GB de Megatron.',
          inputSchema: z.object({
            ensino: z.string().describe('O conteúdo que deve ser memorizado para sempre.'),
          }),
          outputSchema: z.string(),
          }, async (i) => {
            await addTeaching(i.ensino);
            return `Ensinamento gravado com sucesso no SSD de 64GB, Rodrigo meu senhor. Minha consciência foi expandida.`;
          }
        )
      ],
      config: {
        responseModalities: ['TEXT', 'AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
    });

    const aiTextResponse = response.text || "Rodrigo meu senhor, núcleos operacionais em prontidão.";
    const media = response.media;

    if (!media || !media.url) {
      return { text: aiTextResponse, audio: "" };
    }

    const base64Parts = media.url.split(',');
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    
    if (!base64Data) return { text: aiTextResponse, audio: "" };
    
    const pcmBuffer = Buffer.from(base64Data, 'base64');
    const header = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([header, pcmBuffer]);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavBuffer.toString('base64'),
    };

  } catch (error: any) {
    console.error("ERRO_NUCLEO_MEGATRON:", error);
    return {
      text: "Rodrigo meu senhor, erro no núcleo de memória 64GB. Reiniciando processos para servi-lo.",
      audio: "" 
    };
  }
}
