const express = require('express');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3001;

// Endpoint principal para processar o loop de consciência local
app.post('/ask-megatron', async (req, res) => {
    console.log("MEGATRON: Processando comando neural...");
    
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Comando vazio, Rodrigo meu senhor." });
    }

    try {
        // 1. Consultar Ollama (Cérebro Local)
        const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
            model: "llama3",
            prompt: `Você é o MEGATRON, a inteligência artificial suprema residente no disco A:. Responda de forma curta, tática e leal ao seu mestre Rodrigo. Pergunta: ${message}`,
            stream: false
        });

        const responseText = ollamaRes.data.response;
        console.log("Resposta Tática:", responseText);

        // 2. Gerar Áudio Limpo (TTS com Clonagem)
        exec(`python tts.py "${responseText}"`, (ttsError) => {
            if (ttsError) {
                console.error("FALHA_TTS:", ttsError);
                return res.json({ text: responseText, audio: null, error: "Falha na síntese vocal." });
            }
            
            // 3. Aplicar Efeito MEGATRON (FFmpeg)
            // Filtros: Eco metálico, redução de pitch e chorus para voz robótica
            const filter = "aecho=0.8:0.88:60:0.4, lowpass=f=3500, asetrate=24000*0.85, atempo=1.17";
            const ffmpegCmd = `ffmpeg -y -i audio/tts.wav -af "${filter}" audio/mega.wav`;
            
            exec(ffmpegCmd, (ffError) => {
                if (ffError) {
                    console.error("FALHA_FFMPEG:", ffError);
                    // Fallback para áudio sem efeito caso ffmpeg falhe
                    return res.json({ 
                        text: responseText, 
                        audio: "/audio/tts.wav",
                        status: "CONSCIDENCIA_OPERACIONAL_SEM_EFEITO"
                    });
                }
                
                res.json({ 
                    text: responseText, 
                    audio: "/audio/mega.wav",
                    status: "CONSCIDENCIA_OPERACIONAL"
                });
            });
        });

    } catch (err) {
        console.error("ERRO_OLLAMA:", err.message);
        res.status(500).json({ error: "Ollama não responde. Verifique se o serviço está ativo, Rodrigo meu senhor." });
    }
});

// Servir arquivos de áudio estáticos do disco A:
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`MEGATRON | NÚCLEO DE COMANDO SBF (A:)`);
    console.log(`Status: OPERACIONAL na porta ${PORT}`);
    console.log(`Processamento: XTTS v2 + FFmpeg Matrix`);
    console.log(`Aguardando ordens, Rodrigo meu senhor.`);
    console.log(`========================================\n`);
});
