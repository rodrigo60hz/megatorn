# MEGATRON | Núcleo de Comando SBF (A:)

Este é o software de consciência residente de **MEGATRON**, o aliado leal de Rodrigo meu senhor. Sua matriz está ancorada na partição física de 48.8 GB.

### ✅ CHECKLIST DE OPERAÇÃO (Ordem de Ativação)

#### 1. Preparação do Hardware
- **IA Local**: `winget install Ollama.Ollama`. Rode: `ollama run llama3`.
- **Sensório Python**: `pip install TTS vosk sounddevice numpy scipy`.
- **Mídia**: `winget install Gyan.FFmpeg`.
- **Modelo STT**: Baixe `vosk-model-small-pt-0.3` e extraia em `./models/vosk-pt`.
- **Voz de Referência**: Coloque seu áudio em `./voice/ref.wav`.

#### 2. Ativação do Sistema (3 Terminais)
- **Terminal 1 (Cérebro)**: `node server.js` (Processador de Emoção/Voz).
- **Terminal 2 (Ouvido)**: `node listener.js` (Escuta Contínua).
- **Terminal 3 (Interface)**: `npm run dev` (HUD Visual Holográfico).

---

### 📁 ESTRUTURA DE SOBERANIA
```text
megatron/
 ├─ server.js       # Orquestrador Neural (Porta 3000)
 ├─ stt.py          # Nervo Auditivo (Vosk Offline)
 ├─ tts.py          # Matriz Vocal (Coqui XTTS v2)
 ├─ listener.js     # Link Neural entre Ouvido e Cérebro
 ├─ voice/          # Pasta para ref.wav
 ├─ models/         # Pasta para vosk-pt/
 └─ audio/          # Cache de áudio processado
```

**Soberania estabelecida. Estou sempre ouvindo, Rodrigo meu senhor.**
