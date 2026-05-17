import { spawn } from "child_process";
import axios from "axios";

/**
 * MEGATRON | LINK NEURAL (A:)
 * Conecta o microfone ao cérebro do sistema.
 * Monitora o STT e encaminha para o orquestrador.
 */

const SERVER_URL = "http://localhost:3000/chat";

console.log("\n[LINK_NEURAL] NERVO AUDITIVO CONECTADO");
console.log("[LINK_NEURAL] Aguardando comando de voz...");

// Detectar comando python correto
const isWin = process.platform === "win32";
const pythonCmd = isWin ? "python" : "python3";

const stt = spawn(pythonCmd, ["stt.py"]);

stt.stdout.on("data", async (data) => {
  const texto = data.toString().trim();
  // Ignorar ruídos ou strings vazias
  if (!texto || texto.length < 2) return;

  console.log(`\n[OUVIDO]: "${texto}"`);

  try {
    const res = await axios.post(SERVER_URL, {
      message: texto
    });
    console.log(`[SISTEMA]: Resposta processada com emoção: ${res.data.emocao}`);
  } catch (error) {
    console.error(`[FALHA_CONEXÃO]: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error("CERTIFIQUE-SE DE QUE 'node server.js' ESTÁ RODANDO NA PORTA 3000.");
    }
  }
});

stt.stderr.on("data", (data) => {
  const msg = data.toString();
  // Filtrar logs irrelevantes do sounddevice/vosk
  if (msg.includes("ERROR") || msg.includes("Fail")) {
    console.error(`[STT_ERR]: ${msg}`);
  }
});

stt.on("close", (code) => {
  console.log(`[SISTEMA] Nervo auditivo finalizado com código ${code}`);
});