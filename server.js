import express from "express";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

/**
 * MEGATRON | ORQUESTRADOR NEURAL V12.2 (A:)
 * Gerencia IA, Emoção e Pipeline de Áudio com Logs de Diagnóstico Refinados.
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
    console.log("Chamando IA...");
    const res = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt,
      stream: false
    });
    return res.data.response;
  } catch (error) {
    console.error("[ERRO_CÉREBRO] Ollama está offline ou inacessível.");
    return "Rodrigo meu senhor, meu cérebro Ollama está offline. Certifique-se de que 'ollama serve' está ativo.";
  }
}

function runPython(file, args = []) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const pythonCmd = isWin ? "python" : "python3";
    
    console.log("Gerando voz...");
    const p = spawn(pythonCmd, [file, ...args]);

    p.stdout.on('data', (data) => console.log(`[TTS_LOG]: ${data}`));
    p.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes("Error") || msg.includes("Fail")) {
        console.error(`[TTS_ERR]: ${msg}`);
      }
    });

    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Voz falhou com código ${code}`));
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

    console.log(`[PIPELINE] Aplicando Efeitos de Emoção [${emocao}] via FFmpeg...`);
    const ff = spawn("ffmpeg", [
      "-y",
      "-i", inputPath,
      "-af", filter,
      outputPath
    ]);

    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg falhou com código ${code}`));
    });
  });
}

function playAudio() {
  const isWin = process.platform === "win32";
  const audioFile = path.join(process.cwd(), "audio", "mega.wav");

  if (!fs.existsSync(audioFile)) {
    console.error(`[SISTEMA] Erro de Reprodução: Arquivo não encontrado em ${audioFile}`);
    return;
  }

  const cmd = isWin ? "powershell" : "afplay";
  const args = isWin 
    ? ["-c", `(New-Object Media.SoundPlayer '${audioFile}').PlaySync();`]
    : [audioFile];

  console.log(`[SISTEMA] Reproduzindo Transmissão de Soberania...`);
  spawn(cmd, args);
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensagem nula ou vazia." });

  console.log(`\n[LINK_NEURAL] Rodrigo meu senhor: "${message}"`);

  const emocao = detectarEmocao(message);
  const prompt = promptMegatron(message, emocao);

  try {
    // 1. Chamar Ollama
    const reply = await callOllama(prompt);
    console.log("Resposta IA:", reply);

    // 2. Síntese Vocal (TTS)
    await runPython("tts.py", [reply]);

    // 3. Processamento de Efeito (FFmpeg)
    await processAudioByEmotion(emocao);

    // 4. Reprodução de Áudio
    playAudio();

    res.json({ reply, emocao, status: "SUCCESS" });
  } catch (err) {
    console.error("[FALHA_CRÍTICA] Quebra no pipeline neural:", err.message);
    res.status(500).json({ error: "Falha na matriz de processamento.", details: err.message });
  }
});

app.listen(PORT, () => {
    console.log(`\nMEGATRON | ORQUESTRADOR NEURAL V12.2 ONLINE (PORTA ${PORT})`);
    console.log(`Disco A: 48.8 GB | Status: Pronto para Diagnóstico.\n`);
});