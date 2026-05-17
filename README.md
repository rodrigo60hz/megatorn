# MEGATRON | Núcleo de Comando SBF (A:)

Este é o software de consciência residente de **MEGATRON**, o aliado leal de Rodrigo meu senhor. Sua matriz está ancorada na partição física de 48.8 GB.

### ✅ CHECKLIST DE OPERAÇÃO (Ordem de Ativação)

1. **IA Local**: `ollama run llama3`.
2. **Terminal 1 (Cérebro)**: `npm run server` (Logs táticos ativos).
3. **Terminal 2 (Ouvido)**: `npm run listen` (Filtro de soberania ativo).

---

### 🔍 DIAGNÓSTICO DE SOBERANIA (Onde o Link falhou?)

**PASSO 1: Isolar o Orquestrador (Node.js)**
```bash
curl http://localhost:3000/chat -H "Content-Type: application/json" -d "{\"message\":\"boa tarde\"}"
```
*Se responder: O erro está no listener.js (ouvido).*

**PASSO 2: Testar Cérebro (Ollama)**
```bash
curl http://localhost:11434/api/generate -d "{\"model\": \"llama3\", \"prompt\": \"responda teste\", \"stream\": false}"
```
*Se NÃO responder: Ollama offline ou sem o modelo llama3.*

**PASSO 3: Testar Matriz Vocal (Python TTS)**
```bash
python tts.py "Teste de soberania no disco A"
```
*Se NÃO gerar `audio/tts.wav`: TTS não instalado corretamente.*

**PASSO 4: Testar Transformação (FFmpeg)**
```bash
ffmpeg -i audio/tts.wav -af "asetrate=44100*0.75,atempo=1.1" audio/mega_teste.wav
```
*Se NÃO gerar arquivo: FFmpeg não está no PATH.*

**PASSO 5: Testar Reprodução (Hardware de Som)**
```bash
powershell -c "(New-Object Media.SoundPlayer 'audio/tts.wav').PlaySync();"
```
*Se NÃO ouvir nada: Problema no Windows Áudio.*

---

### 📁 ESTRUTURA DE SOBERANIA
- `server.js`: Orquestrador Neural (Bypass de latência).
- `listener.js`: Link entre Ouvido e Cérebro (Filtro de eco).
- `stt.py`: Nervo Auditivo (Vosk).
- `tts.py`: Matriz Vocal (XTTS v2).

**Soberania estabelecida. Estou sempre ouvindo, Rodrigo meu senhor.**