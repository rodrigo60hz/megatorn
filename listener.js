import { spawn } from "child_process";
import axios from "axios";

/**
 * MEGATRON | LINK NEURAL (A:) - FILTRO DE SOBERANIA
 * Conecta o microfone ao orquestrador central.
 * Elimina redundâncias e garante a entrega única de comandos.
 */

const SERVER_URL = "http://localhost:3000/chat";

console.log("\n[LINK_NEURAL] NERVO AUDITIVO CONECTADO");
console.log("[LINK_NEURAL] Escuta contínua ativa. Aguardando comando de Rodrigo meu senhor...");

// Detectar comando python correto para o hardware
const isWin = process.platform === "win32";
const pythonCmd = isWin ? "python" : "python3";

const stt = spawn(pythonCmd, ["stt.py"]);

let ultima = ""; // Memória de curto prazo para evitar redundância

stt.stdout.on("data", async (data) => {
  const texto = data.toString().trim();

  // Filtro 1: Ignorar silêncio ou ruídos curtos
  if (!texto || texto.length < 2) return;

  // Filtro 2: Ignorar repetições fantasmas (Vosk glitch)
  if (texto === ultima) return;
  ultima = texto;

  console.log(`\n[RODRIGO MEU SENHOR]: "${texto}"`);

  try {
    // Transmissão segura para o Orquestrador Central
    const res = await axios.post(SERVER_URL, {
      message: texto
    });

    console.log(`[MEGATRON]: ${res.data.reply}`);
    if (res.data.emocao) {
      console.log(`[ESTADO]: Matriz emocional em modo ${res.data.emocao.toUpperCase()}`);
    }

  } catch (err) {
    console.error(`[FALHA_TRANSMISSÃO]: ${err.message}`);
    if (err.code === 'ECONNREFUSED') {
      console.error("ERRO CRÍTICO: O servidor (server.js) não está respondendo na porta 3000.");
    }
  }
});

stt.stderr.on("data", (data) => {
  const msg = data.toString();
  // Filtrar apenas erros reais do Vosk/SoundDevice para não poluir o terminal
  if (msg.includes("ERROR") || msg.includes("Fail")) {
    console.error(`[SISTEMA_AUDITIVO_ERR]: ${msg}`);
  }
});

stt.on("close", (code) => {
  console.log(`\n[LINK_NEURAL] Nervo auditivo finalizado (Código ${code})`);
});
