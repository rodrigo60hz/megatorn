import queue
import sounddevice as sd
import json
import sys
import os
from vosk import Model, KaldiRecognizer

def transcribe():
    model_path = "models/vosk-pt"
    if not os.path.exists(model_path):
        print(json.dumps({"error": "Modelo Vosk não encontrado em " + model_path}))
        return

    model = Model(model_path)
    q = queue.Queue()

    def callback(indata, frames, time, status):
        if status:
            print(status, file=sys.stderr)
        q.put(bytes(indata))

    rec = KaldiRecognizer(model, 16000)

    try:
        with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                               channels=1, callback=callback):
            print("\nMEGATRON | NERVO AUDITIVO ATIVO")
            sys.stdout.flush()

            while True:
                data = q.get()
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    text = result.get("text", "")
                    if text:
                        print(text)
                        sys.stdout.flush()
    except Exception as e:
        print(f"FALHA_STT: {str(e)}")

if __name__ == "__main__":
    transcribe()
