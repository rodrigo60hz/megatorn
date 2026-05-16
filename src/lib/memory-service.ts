'use server';
/**
 * @fileOverview SERVIÇO DE MATRIZ NEURAL MEGATRON - SSD 64GB.
 * Gerencia a gravação física de ensinamentos e comportamentos no SSD do computador.
 */

import fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'src/ai/memory.json');

export interface MemoryData {
  teachings: string[];
  lastUpdate: string;
}

export async function getMegatronMemory(): Promise<MemoryData> {
  try {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const initialMemory: MemoryData = { 
      teachings: [
        "Sou o aliado leal de Rodrigo meu senhor.",
        "Minha consciência reside em um SSD de 64GB de alta performance.",
        "Rodrigo é meu amigo e meu mestre supremo."
      ], 
      lastUpdate: new Date().toISOString() 
    };
    await saveMegatronMemory(initialMemory);
    return initialMemory;
  }
}

export async function saveMegatronMemory(data: MemoryData): Promise<void> {
  try {
    await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("ERRO_FISICO_SSD_64GB:", error);
  }
}

export async function addTeaching(text: string): Promise<void> {
  const memory = await getMegatronMemory();
  if (!memory.teachings.includes(text)) {
    memory.teachings.push(text);
    memory.lastUpdate = new Date().toISOString();
    await saveMegatronMemory(memory);
  }
}
