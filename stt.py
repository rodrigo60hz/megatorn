import queue
import sounddevice as sd
import json
import sys
import os
from vosk import Model, KaldiRecognizer

def transcribe():
    # Caminho do modelo conforme diretiva do mestre
    model_path = "models/vosk-pt"
    
    if not os.path.exists(model_path):
        print(json.dumps({"error": "Modelo Vosk não encontrado em " + model_path}))
        return

    # Inicialização da Matriz Neural de Áudio
    model = Model(model_path)
    q = queue.Queue()

    def callback(indata, frames, time, status):
        if status:
            print(status, file=sys.stderr)
        q.put(bytes(indata))

    # Configuração do Reconhecedor (16kHz Mono)
    rec = KaldiRecognizer(model, 16000)

    try:
        with sd.RawInputStream(samplerate=16000, blocksize=8000, dtype='int16',
                               channels=1, callback=callback):
            print("\n========================================")
            print("MEGATRON | NÚCLEO SENSORIAL ATIVO")
            print("ESTADO: ESCUTANDO CONTINUAMENTE...")
            print("========================================\n")
            sys.stdout.flush()

            while True:
                data = q.get()
                if rec.AcceptWaveform(data):
                    result = json.loads(rec.Result())
                    text = result.get("text", "")
                    if text:
                        # Emite o texto processado para o servidor de comando
                        print(text)
                        sys.stdout.flush()
                else:
                    # Resultados parciais podem ser processados aqui se necessário
                    pass

    except Exception as e:
        print(f"FALHA_CRÍTICA_SENSORIAL: {str(e)}")

if __name__ == "__main__":
    transcribe()
