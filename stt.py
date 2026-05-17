import sys
import os
import wave
import json
from vosk import Model, KaldiRecognizer

def transcribe():
    # Caminhos configurados conforme checklist do mestre
    model_path = "models/vosk-pt"
    audio_path = "audio/input.wav"

    if not os.path.exists(model_path):
        print(json.dumps({"error": "Modelo Vosk não encontrado em " + model_path}))
        return

    if not os.path.exists(audio_path):
        print(json.dumps({"error": "Arquivo de entrada audio/input.wav não encontrado."}))
        return

    model = Model(model_path)
    wf = wave.open(audio_path, "rb")
    
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
        print(json.dumps({"error": "O áudio deve estar em formato WAV MONO PCM."}))
        return

    rec = KaldiRecognizer(model, wf.getframerate())

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            pass
    
    final = json.loads(rec.FinalResult())
    print(final.get("text", ""))

if __name__ == "__main__":
    transcribe()
