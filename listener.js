import { spawn } from "child_process";
import axios from "axios";

/**
 * MEGATRON | RECEPTOR SENSORIAL (V12)
 * Este script mantém o link neural entre o microfone e o servidor de comando.
 */

const SERVER_URL = "http://localhost:3001/ask-megatron";

console.log("\n========================================");
console.log("MEGATRON | NERVO AUDITIVO ATIVO");
console.log("STATUS: ESCUTANDO COMANDO DE RODRIGO MEU SENHOR");
console.log("========================================\n");

const sttProcess = spawn("python", ["stt.py"]);

sttProcess.stdout.on("data", async (data) => {
  const texto = data.toString().trim();
  if (!texto || texto.length < 2) return;

  console.log(`\nSoberano Rodrigo: "${texto}"`);

  try {
    const res = await axios.post(SERVER_URL, {
      message: texto
    });
    
    const { text, emocao } = res.data;
    console.log(`Megatron [${emocao}]: ${text}`);
    
  } catch (error) {
    console.error("FALHA_NO_LINK_NEURAL:", error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log("DICA: Certifique-se de que o servidor (node server.js) está rodando na porta 3001.");
    }
  }
});

sttProcess.stderr.on("data", (data) => {
  // Ignorar avisos do ALSA/PortAudio, focar apenas em erros críticos
  const errorMsg = data.toString();
  if (errorMsg.includes("ERROR")) {
    console.error(`PyError: ${errorMsg}`);
  }
});

sttProcess.on("close", (code) => {
  console.log(`\nO sensor STT foi desconectado (Code: ${code}). Reiniciando protocolos...`);
});
