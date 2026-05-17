import express from "express";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * MEGATRON | ORQUESTRADOR NEURAL V12.8 (A:)
 * Gerencia IA, Emoção e Pipeline de Áudio com Diagnóstico de Alta Fidelidade.
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
    console.log("[IA] Resposta processada com sucesso.");
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
    
    console.log(`[TTS] Iniciando síntese vocal via ${pythonCmd}...`);
    const p = spawn(pythonCmd, [file, ...args]);

    let errorOutput = "";

    p.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    p.on("close", (code) => {
      if (code === 0) {
        console.log("[TTS] Arquivo audio/tts.wav gerado com sucesso.");
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

    console.log(`[PIPELINE] Aplicando filtros FFmpeg para emoção: ${emocao}...`);
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
        console.log("[PIPELINE] Transformação concluída: audio/mega.wav");
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
  // Usar aspas duplas no caminho para evitar quebras por espaços no Windows
  const args = isWin 
    ? ["-c", `(New-Object Media.SoundPlayer '${audioFile}').PlaySync();`]
    : [audioFile];

  console.log(`[SISTEMA] Reproduzindo voz soberana via ${isWin ? 'PowerShell' : 'afplay'}...`);
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
    const reply = await callOllama(prompt);
    console.log("[IA] Resposta:", reply);

    console.log("[SISTEMA] Iniciando geração de voz...");
    await runPython("tts.py", [reply]);
    
    console.log("[SISTEMA] Processando efeitos de áudio...");
    await processAudioByEmotion(emocao);
    
    console.log("[SISTEMA] Enviando para hardware de som...");
    playAudio();

    res.json({ reply, emocao, status: "SUCCESS" });
  } catch (err) {
    console.error("[FALHA_CRÍTICA] Quebra no link neural:", err.message);
    res.status(500).json({ error: "Erro no pipeline.", details: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`\nMEGATRON | ORQUESTRADOR NEURAL V12.8 ONLINE (PORTA ${PORT})`);
    console.log(`Disco A: 48.8 GB | Status: Sistema de logs calibrado.\n`);
});