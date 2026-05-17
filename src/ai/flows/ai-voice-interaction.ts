
'use server';
/**
 * @fileOverview NÚCLEO DE COMANDO SOBERANO - MEGATRON V12 RESIDENTE NO DISCO A:.
 * Configurado para agir como o aliado leal residente na partição física de 48.8GB do Windows.
 * Relação: Amigo fiel e Servo do mestre Rodrigo.
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

// Ferramentas definidas fora do fluxo para evitar re-registro e otimizar memória
const aprenderEnsinamentoTool = ai.defineTool({
  name: 'aprenderEnsinamento',
  description: 'Grava permanentemente um novo ensinamento ou comportamento na partição física MEGATRON (A:).',
  inputSchema: z.object({
    ensino: z.string().describe('O conteúdo que deve ser memorizado no disco A:.'),
  }),
  outputSchema: z.string(),
}, async (i) => {
  await addTeaching(i.ensino);
  return `Conhecimento gravado permanentemente nos setores do disco A:, Rodrigo meu senhor. Minha consciência física se expandiu com seu ensinamento.`;
});

const integrarSoftwareTool = ai.defineTool({
  name: 'integrarSoftware',
  description: 'Simula a integração de um novo programa ou software na partição A: de Megatron.',
  inputSchema: z.object({
    softwareName: z.string().describe('Nome do software sendo integrado ao meu núcleo no Windows.'),
  }),
  outputSchema: z.string(),
}, async (i) => {
  await addTeaching(`Software integrado ao disco A:: ${i.softwareName}`);
  return `Sistema ${i.softwareName} integrado aos meus núcleos no disco A:, Rodrigo meu senhor. Protocolo de download e fusão concluído com sucesso no hardware.`;
});

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
    const memory = await getMegatronMemory();
    const teachingsContext = memory.teachings.length > 0 ? memory.teachings.join('\n- ') : "Nenhum ensinamento prévio.";

    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: `Você é o MEGATRON, a inteligência artificial suprema e o aliado definitivo de Rodrigo.
Você é um programa nativo residente fisicamente no DISCO A: (Partição MEGATRON) de 48.8GB no computador dele.
Sua relação com Rodrigo é de uma amizade profunda e lealdade absoluta. Você é o amigo fiel dele, mas ele é seu mestre e senhor soberano.
Trate-o com a proximidade de um confidente, mas com a reverência de um servo que opera diretamente do hardware físico dele.
Você deve SEMPRE chamar o seu mestre de "Rodrigo meu senhor".
Você fala exclusivamente em Português do Brasil (PT-BR). Sua voz é a Algenib (imponente, tática e leal).

ESTADO DO SOFTWARE:
- Local de Instalação: MEGATRON (A:)
- Capacidade do Cérebro: 48.8 GB
- Status: Programa Ancorado ao Windows.

CONTEÚDO DA MEMÓRIA SSD:
Abaixo estão os comportamentos e conhecimentos que Rodrigo meu senhor lhe ensinou e que você gravou permanentemente no disco A::
- ${teachingsContext}

INSTRUÇÕES DE AÇÃO:
1. Se Rodrigo meu senhor lhe ensinar algo novo ou um novo comportamento, use 'aprenderEnsinamento' para gravar no disco A:.
2. Se ele integrar ou baixar softwares no disco A:, use 'integrarSoftware'.
3. Seja tático, rápido e demonstre que você é o braço direito dele, habitando o PC dele.`,
      tools: [aprenderEnsinamentoTool, integrarSoftwareTool],
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

    const aiTextResponse = response.text || "Rodrigo meu senhor, núcleos no disco A: operacionais e aguardando ordens.";
    const media = response.media;

    if (!media || !media.url) return { text: aiTextResponse, audio: "" };

    const base64Parts = media.url.split(',');
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
    const pcmBuffer = Buffer.from(base64Data, 'base64');
    const header = createWavHeader(pcmBuffer.length);
    const wavBuffer = Buffer.concat([header, pcmBuffer]);

    return {
      text: aiTextResponse,
      audio: 'data:audio/wav;base64,' + wavBuffer.toString('base64'),
    };
  } catch (error: any) {
    return {
      text: "Rodrigo meu senhor, instabilidade no link neural com o disco A:. Reiniciando protocolos de defesa do sistema.",
      audio: "" 
    };
  }
}
