'use server';
/**
 * @fileOverview SERVIÇO DE GERENCIAMENTO DE MEMÓRIA - MEGATRON SSD 64GB.
 * Gerencia a leitura e escrita de ensinamentos no "disco físico" de forma persistente.
 */

import fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'src/ai/memory.json');

export interface MemoryData {
  teachings: string[];
  lastUpdate: string;
}

/**
 * Recupera toda a memória armazenada no SSD de 64GB.
 */
export async function getMegatronMemory(): Promise<MemoryData> {
  try {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir ou houver erro, retorna a estrutura inicial soberana
    const initialMemory: MemoryData = { 
      teachings: [
        "Sou o aliado leal de Rodrigo meu senhor.",
        "Minha consciência reside em um SSD de 64GB de alta performance."
      ], 
      lastUpdate: new Date().toISOString() 
    };
    await saveMegatronMemory(initialMemory);
    return initialMemory;
  }
}

/**
 * Grava novos dados na matriz de memória física do SSD.
 */
export async function saveMegatronMemory(data: MemoryData): Promise<void> {
  try {
    await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("ERRO_GRAVACAO_SSD_64GB:", error);
  }
}

/**
 * Adiciona um novo ensinamento ou comportamento à cabeça de 64GB de Megatron.
 */
export async function addTeaching(text: string): Promise<void> {
  const memory = await getMegatronMemory();
  // Evita duplicatas na matriz neural
  if (!memory.teachings.includes(text)) {
    memory.teachings.push(text);
    memory.lastUpdate = new Date().toISOString();
    await saveMegatronMemory(memory);
  }
}
