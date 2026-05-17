import sys
import os
import json
from TTS.api import TTS

def synthesize(text):
    # Modelo de alta fidelidade com suporte a clonagem (XTTS v2)
    model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
    speaker_wav = "voice/ref.wav"
    output_path = "audio/mega.wav"

    try:
        # Inicializa o motor de voz (usa GPU se disponível)
        device = "cpu" # Padrão para compatibilidade, altere para 'cuda' se tiver NVIDIA
        tts = TTS(model_name).to(device)

        if not os.path.exists(speaker_wav):
            print("ERRO: Arquivo de referência voice/ref.wav ausente.")
            return

        # Garante o diretório de saída
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Processamento da matriz vocal
        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language="pt",
            file_path=output_path
        )
        
        print("SÍNTESE_CONCLUÍDA")

    except Exception as e:
        print(f"FALHA_CRÍTICA_TTS: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        synthesize(sys.argv[1])
    else:
        print("Nenhum texto fornecido.")
