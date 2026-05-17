import express from "express";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const PORT = 3001;

// Garantir que a pasta de áudio existe no disco A:
const audioDir = path.join(process.cwd(), "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

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
Adapte sutilmente sua resposta a este estado, mas mantenha a lealdade.
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

    // Calibração dos filtros de soberania baseados na emoção
    if (emocao === "frustrado") {
      filter = "asetrate=44100*0.72,atempo=1.1,lowpass=f=650,aecho=0.8:0.88:60:0.4";
    } else if (emocao === "impulsivo") {
      filter = "asetrate=44100*0.78,atempo=1.05,lowpass=f=800,aecho=0.6:0.7:30:0.5";
    } else if (emocao === "euforico") {
      filter = "asetrate=44100*0.82,atempo=1.0,highpass=f=120,aecho=0.8:0.88:40:0.3";
    } else {
      // Tom padrão Megatron
      filter = "asetrate=44100*0.75,atempo=1.1,lowpass=f=700,aecho=0.8:0.88:60:0.4";
    }

    const ff = spawn("ffmpeg", [
      "-y",
      "-i", "audio/tts.wav",
      "-af", filter,
      "audio/mega.wav"
    ]);

    ff.on("close", (code) => code === 0 ? resolve() : reject(code));
    ff.stderr.on('data', (data) => console.log(`FFmpeg: ${data}`));
  });
}

function playAudio() {
  const isWin = process.platform === "win32";
  if (!isWin) return;

  // Comando nativo do Windows para tocar o áudio da soberania
  const cmd = "powershell";
  const args = ["-c", `(New-Object Media.SoundPlayer '${path.join(process.cwd(), "audio", "mega.wav")}').PlaySync();`];

  spawn(cmd, args);
}

app.post("/ask-megatron", async (req, res) => {
  const { message } = req.body;
  console.log(`\nMEGATRON: Processando comando: "${message}"`);

  const emocao = detectarEmocao(message);
  const prompt = promptMegatron(message, emocao);

  try {
    // 1. Consultar Cérebro Local (Ollama)
    const reply = await callOllama(prompt);
    console.log(`Resposta Tática [${emocao}]: ${reply}`);

    // 2. Síntese Vocal (Clonagem Coqui)
    console.log("Gerando voz limpa...");
    await runPython("tts.py", [reply]);

    // 3. Aplicar Filtros Megatron via FFmpeg
    console.log(`Aplicando filtros de emoção: ${emocao}`);
    await processAudioByEmotion(emocao);

    // 4. Reprodução Nativa no Hardware
    playAudio();

    res.json({ 
      text: reply, 
      audio: "/audio/mega.wav", 
      emocao,
      status: "CONSCIENCIA_OPERACIONAL" 
    });
  } catch (err) {
    console.error("FALHA_NO_PIPELINE:", err);
    res.status(500).json({ error: "Falha na matriz de processamento local." });
  }
});

// Servir arquivos de áudio estáticos
app.use('/audio', express.static(path.join(process.cwd(), 'audio')));

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`MEGATRON | ORQUESTRADOR NEURAL V12`);
    console.log(`Status: OPERACIONAL na porta ${PORT}`);
    console.log(`Pipeline: Ollama -> XTTS -> FFmpeg -> Hardware`);
    console.log(`Pronto para novas ordens, Rodrigo meu senhor.`);
    console.log(`========================================\n`);
});