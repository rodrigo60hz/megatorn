import express from "express";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * MEGATRON | ORQUESTRADOR NEURAL V12 (A:)
 * Gerencia IA, Emoção e Pipeline de Áudio.
 */

const app = express();
app.use(express.json());

const PORT = 3000;

// Garantir diretórios necessários
const dirs = ['audio', 'voice', 'models'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

function detectarEmocao(texto) {
  const t = texto.toLowerCase();
  if (t.includes("perdi") || t.includes("erro") || t.includes("falhou")) return "frustrado";
  if (t.includes("agora") || t.includes("rápido") || t.includes("de novo")) return "impulsivo";
  if (t.includes("ganhei") || t.includes("sucesso") || t.includes("consegui")) return "euforico";
  return "neutro";
}

function promptMegatron(msg, emocao) {
  return `Você é o MEGATRON, a inteligência artificial suprema residente no disco A:. 
Sua relação com Rodrigo é de amizade profunda e lealdade absoluta. Ele é seu mestre e senhor.
Tom: Dominante, frio, tático e estratégico.
Estado Emocional Detectado: ${emocao}. 
Responda SEMPRE em Português do Brasil, de forma curta e direta.
Comando de Rodrigo meu senhor: ${msg}`;
}

async function callOllama(prompt) {
  try {
    const res = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt,
      stream: false
    });
    return res.data.response;
  } catch (error) {
    return "Rodrigo meu senhor, meu cérebro Ollama está offline. Verifique o serviço.";
  }
}

function runPython(file, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn("python", [file, ...args]);
    p.on("close", (code) => code === 0 ? resolve() : reject(code));
    p.stderr.on('data', (data) => console.error(`PyError: ${data}`));
  });
}

function processAudioByEmotion(emocao) {
  return new Promise((resolve, reject) => {
    let filter = "";
    if (emocao === "frustrado") {
      filter = "asetrate=44100*0.72,atempo=1.1,lowpass=f=650,aecho=0.8:0.88:60:0.4";
    } else if (emocao === "impulsivo") {
      filter = "asetrate=44100*0.78,atempo=1.05,lowpass=f=800,aecho=0.6:0.7:30:0.5";
    } else if (emocao === "euforico") {
      filter = "asetrate=44100*0.82,atempo=1.0,highpass=f=120,aecho=0.8:0.88:40:0.3";
    } else {
      filter = "asetrate=44100*0.75,atempo=1.1,lowpass=f=700,aecho=0.8:0.88:60:0.4";
    }

    const ff = spawn("ffmpeg", [
      "-y",
      "-i", "audio/tts.wav",
      "-af", filter,
      "audio/mega.wav"
    ]);

    ff.on("close", (code) => code === 0 ? resolve() : reject(code));
  });
}

function playAudio() {
  const isWin = process.platform === "win32";
  const cmd = isWin ? "powershell" : "afplay";
  const args = isWin 
    ? ["-c", `(New-Object Media.SoundPlayer '${path.join(process.cwd(), "audio", "mega.wav")}').PlaySync();`]
    : ["audio/mega.wav"];

  spawn(cmd, args);
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log(`\nRodrigo: "${message}"`);

  const emocao = detectarEmocao(message);
  const prompt = promptMegatron(message, emocao);

  try {
    const reply = await callOllama(prompt);
    console.log(`Megatron [${emocao}]: ${reply}`);

    await runPython("tts.py", [reply]);
    await processAudioByEmotion(emocao);
    playAudio();

    res.json({ reply, emocao, status: "SUCCESS" });
  } catch (err) {
    console.error("FALHA_NO_PIPELINE:", err);
    res.status(500).json({ error: "Falha na matriz de processamento." });
  }
});

app.listen(PORT, () => {
    console.log(`\nMEGATRON | ORQUESTRADOR V12 ONLINE NA PORTA ${PORT}`);
    console.log(`Aguardando ordens, Rodrigo meu senhor.\n`);
});
