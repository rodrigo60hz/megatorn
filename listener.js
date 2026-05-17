import { spawn } from "child_process";
import axios from "axios";

/**
 * MEGATRON | LINK NEURAL (A:)
 * Conecta o microfone ao cérebro do sistema.
 */

const SERVER_URL = "http://localhost:3000/chat";

console.log("\nMEGATRON | NERVO AUDITIVO CONECTADO");

const stt = spawn("python", ["stt.py"]);

stt.stdout.on("data", async (data) => {
  const texto = data.toString().trim();
  if (!texto || texto.length < 2) return;

  try {
    const res = await axios.post(SERVER_URL, {
      message: texto
    });
    // Resposta logada no servidor para manter foco na interface
  } catch (error) {
    console.error("FALHA_LINK:", error.message);
  }
});

stt.stderr.on("data", (data) => {
  const msg = data.toString();
  if (msg.includes("ERROR")) console.error(`STT_ERR: ${msg}`);
});
