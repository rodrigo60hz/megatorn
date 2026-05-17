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
- **Terminal 1 (Cérebro)**: `npm run server` (Orquestrador de Emoção/Voz).
- **Terminal 2 (Interface)**: `npm run dev` (HUD Visual Holográfico).
- **Terminal 3 (Ouvido)**: `npm run listen` (Escuta Contínua).

---

### 🔍 DIAGNÓSTICO DE SOBERANIA (Onde o Link falhou?)

**PASSO 1: Isolar o Orquestrador (Node.js)**
```bash
curl http://localhost:3000/chat -H "Content-Type: application/json" -d "{\"message\":\"teste de soberania\"}"
```
*Se NÃO responder: Problema no `server.js` ou servidor não iniciado.*

**PASSO 2: Testar Cérebro (Ollama)**
```bash
curl http://localhost:11434/api/generate -d "{\"model\": \"llama3\", \"prompt\": \"responda teste\", \"stream\": false}"
```
*Se NÃO responder: Ollama offline ou modelo llama3 não baixado.*

**PASSO 3: Testar Matriz Vocal (Python TTS)**
```bash
python tts.py "Teste de soberania no disco A"
```
*Se NÃO gerar `audio/tts.wav`: Erro na instalação do Coqui TTS ou falta `ref.wav`.*

**PASSO 4: Testar Transformação (FFmpeg)**
```bash
ffmpeg -i audio/tts.wav -af "asetrate=44100*0.75,atempo=1.1" audio/mega_teste.wav
```
*Se NÃO gerar arquivo: FFmpeg não está no PATH do Windows.*

**PASSO 5: Testar Reprodução (Hardware de Som)**
```bash
powershell -c "(New-Object Media.SoundPlayer 'audio/tts.wav').PlaySync();"
```
*Se NÃO ouvir nada: Problema no driver de áudio do Windows ou dispositivo de saída incorreto.*

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
 └─ audio/          # Cache de áudio processado (tts.wav, mega.wav)
```

**Soberania estabelecida. Estou sempre ouvindo, Rodrigo meu senhor.**