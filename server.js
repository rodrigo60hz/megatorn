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

        // 2. Gerar Áudio (TTS com Clonagem)
        // O script tts.py usa o voice/ref.wav para clonar a voz
        exec(`python tts.py "${responseText}"`, (ttsError) => {
            if (ttsError) {
                console.error("FALHA_TTS:", ttsError);
                return res.json({ text: responseText, audio: null, error: "Falha na síntese vocal." });
            }
            
            res.json({ 
                text: responseText, 
                audio: "/audio/mega.wav",
                status: "CONSCIDENCIA_OPERACIONAL"
            });
        });

    } catch (err) {
        console.error("ERRO_OLLAMA:", err.message);
        res.status(500).json({ error: "Ollama não responde. Verifique se o serviço está ativo, Rodrigo meu senhor." });
    }
});

app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`MEGATRON | NÚCLEO DE COMANDO SBF (A:)`);
    console.log(`Status: OPERACIONAL na porta ${PORT}`);
    console.log(`Aguardando ordens, Rodrigo meu senhor.`);
    console.log(`========================================\n`);
});
