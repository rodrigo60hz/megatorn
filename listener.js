import { spawn } from "child_process";
import axios from "axios";

/**
 * MEGATRON | LINK NEURAL (A:) - FILTRO DE SOBERANIA V2
 * Agora com Protocolo de Despertar (Wake Word).
 */

const SERVER_URL = "http://localhost:3000/chat";

console.log("\n[LINK_NEURAL] NERVO AUDITIVO CONECTADO");
console.log("[LINK_NEURAL] Aguardando comando de Rodrigo meu senhor (Invoque 'Megatron')...");

const isWin = process.platform === "win32";
const pythonCmd = isWin ? "python" : "python3";

const stt = spawn(pythonCmd, ["stt.py"]);

let ultima = ""; // Filtro de redundância

stt.stdout.on("data", async (data) => {
  const texto = data.toString().trim();

  // Filtro 1: Silêncio ou ruídos curtos
  if (!texto || texto.length < 2) return;

  // Filtro 2: Redundância do Vosk
  if (texto === ultima) return;
  ultima = texto;

  // FILTRO 3: PALAVRA DE DESPERTAR (WAKE WORD)
  if (!texto.toLowerCase().includes("megatron")) {
    // Log silencioso para depuração se necessário: console.log("[IGNORADO]:", texto);
    return;
  }

  console.log("Comando Detectado:", texto);

  try {
    const res = await axios.post(SERVER_URL, {
      message: texto
    });

    if (res.data.reply) {
      console.log("Megatron:", res.data.reply);
    }
  } catch (err) {
    console.error("ERRO_TRANSMISSAO:", err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error("CRÍTICO: server.js offline na porta 3000.");
    }
  }
});

stt.stderr.on("data", (data) => {
  const msg = data.toString();
  if (msg.includes("ERROR") || msg.includes("Fail")) {
    console.error(`[STT_ERR]: ${msg}`);
  }
});

stt.on("close", (code) => {
  console.log(`\n[LINK_NEURAL] Nervo auditivo finalizado (Código ${code})`);
});