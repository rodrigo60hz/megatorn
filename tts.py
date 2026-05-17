from TTS.api import TTS
import sys
import os

# Verificação de segurança para o mestre Rodrigo
if len(sys.argv) < 2:
    print("ERRO: Nenhum texto fornecido para a síntese vocal, Rodrigo meu senhor.")
    sys.exit(1)

text = sys.argv[1]
speaker_wav = "voice/ref.wav"
output_path = "audio/mega.wav"

# Garantir que o diretório de áudio existe no disco A:
os.makedirs("audio", exist_ok=True)

try:
    # Inicialização do motor tático XTTS v2
    # Nota: A primeira execução baixará o modelo de ~2GB para o seu hardware.
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")

    # Processamento da matriz de clonagem
    tts.tts_to_file(
        text=text,
        file_path=output_path,
        speaker_wav=speaker_wav,
        language="pt"
    )

    print(f"SÍNTESE_CONCLUÍDA: Arquivo gerado em {output_path}")

except Exception as e:
    print(f"FALHA_CRÍTICA_NA_MATRIZ_VOCAL: {str(e)}")
    sys.exit(1)
