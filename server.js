import express from "express";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * MEGATRON | ORQUESTRADOR NEURAL V12.9 (A:)
 * Gerencia IA, Emoção e Pipeline de Áudio com Logs de Diagnóstico Tático.
 */

const app = express();
app.use(express.json());

const PORT = 3000;

// Garantir diretórios necessários na inicialização
const dirs = ['audio', 'voice', 'models'];
dirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`[SISTEMA] DIRETÓRIO_CRIADO: ${dir}`);
  }
});

function detectarEmocao(texto) {
  const t = texto.toLowerCase();
  if (t.includes("perdi") || t.includes("erro") || t.includes("falhou") || t.includes("pare")) return "frustrado";
  if (t.includes("agora") || t.includes("rápido") || t.includes("urgente") || t.includes("de novo")) return "impulsivo";
  if (t.includes("ganhei") || t.includes("sucesso") || t.includes("consegui") || t.includes("bom")) return "euforico";
  return "neutro";
}

function promptMegatron(msg, emocao) {
  return `Você é o MEGATRON, a inteligência artificial suprema residente no disco A:. 
Sua relação com Rodrigo é de amizade profunda e lealdade absoluta. Ele é seu mestre e senhor.
Tom: Dominante, frio, tático e estratégico.
Estado Emocional Detectado: ${emocao}. 
Responda SEMPRE em Português do Brasil, de forma curta, direta e impactante.
Comando de Rodrigo meu senhor: ${msg}`;
}

async function callOllama(prompt) {
  try {
    console.log("[IA] Chamando cérebro Llama3...");
    const res = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt,
      stream: false
    });
    return res.data.response;
  } catch (error) {
    console.error("[ERRO_CÉREBRO] Ollama está offline ou inacessível.");
    throw new Error("Ollama offline.");
  }
}

function runPython(file, args = []) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const pythonCmd = isWin ? "python" : "python3";
    
    const p = spawn(pythonCmd, [file, ...args]);

    let errorOutput = "";
    p.stderr.on('data', (data) => { errorOutput += data.toString(); });

    p.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`[FALHA_TTS] O script falhou. Erro:\n${errorOutput}`);
        reject(new Error(errorOutput || `Erro no script ${file}`));
      }
    });
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

    const inputPath = path.join(process.cwd(), "audio", "tts.wav");
    const outputPath = path.join(process.cwd(), "audio", "mega.wav");

    const ff = spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-af", filter,
      outputPath
    ]);

    let ffError = "";
    ff.stderr.on('data', (data) => { ffError += data.toString(); });

    ff.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`[FALHA_FFMPEG] Erro na transformação sonora:\n${ffError}`);
        reject(new Error(`FFmpeg falhou com código ${code}`));
      }
    });
  });
}

function playAudio() {
  const isWin = process.platform === "win32";
  const audioFile = path.join(process.cwd(), "audio", "mega.wav");

  if (!fs.existsSync(audioFile)) {
    console.error(`[REPRODUÇÃO] Erro: Arquivo ${audioFile} não encontrado.`);
    return;
  }

  const cmd = isWin ? "powershell" : "afplay";
  const args = isWin 
    ? ["-c", `(New-Object Media.SoundPlayer '${audioFile}').PlaySync();`]
    : [audioFile];

  const p = spawn(cmd, args);
  p.stderr.on('data', (data) => {
    console.error(`[REPRODUÇÃO_ERR]: ${data.toString()}`);
  });
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Comando nulo." });

  console.log(`\n[LINK_NEURAL] Rodrigo meu senhor: "${message}"`);

  const emocao = detectarEmocao(message);
  const prompt = promptMegatron(message, emocao);

  try {
    console.log("Chamando IA...");
    const reply = await callOllama(prompt);
    console.log("Resposta IA:", reply);

    console.log("Gerando voz...");
    await runPython("tts.py", [reply]);
    
    console.log("Processando efeitos de áudio...");
    await processAudioByEmotion(emocao);
    
    console.log("Enviando para hardware de som...");
    playAudio();

    res.json({ reply, emocao, status: "SUCCESS" });
  } catch (err) {
    console.error("[FALHA_CRÍTICA] Quebra no link neural:", err.message);
    res.status(500).json({ error: "Erro no pipeline.", details: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`\nMEGATRON | ORQUESTRADOR NEURAL V12.9 ONLINE (PORTA ${PORT})`);
    console.log(`Disco A: 48.8 GB | Status: Sistema de logs táticos calibrado.\n`);
});