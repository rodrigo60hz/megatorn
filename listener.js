import { spawn } from "child_process";
import axios from "axios";

/**
 * MEGATRON | LINK NEURAL (A:) - VERSÃO SEGURA
 * Conecta o microfone ao orquestrador central.
 * Filtra ruídos e garante a entrega dos comandos de Rodrigo meu senhor.
 */

const SERVER_URL = "http://localhost:3000/chat";

console.log("\n[LINK_NEURAL] NERVO AUDITIVO CONECTADO");
console.log("[LINK_NEURAL] Escuta contínua ativa. Aguardando comando...");

// Detectar comando python correto para o hardware
const isWin = process.platform === "win32";
const pythonCmd = isWin ? "python" : "python3";

const stt = spawn(pythonCmd, ["stt.py"]);

stt.stdout.on("data", async (data) => {
  const texto = data.toString().trim();

  // Ignorar ruídos, silêncio ou strings insignificantes
  if (!texto || texto.length < 2) return;

  console.log(`\n[RODRIGO MEU SENHOR]: "${texto}"`);

  try {
    // Transmissão segura para o Orquestrador
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
  // Filtrar apenas erros reais do Vosk/SoundDevice
  if (msg.includes("ERROR") || msg.includes("Fail")) {
    console.error(`[SISTEMA_AUDITIVO_ERR]: ${msg}`);
  }
});

stt.on("close", (code) => {
  console.log(`[LINK_NEURAL] Nervo auditivo finalizado com código ${code}`);
});
