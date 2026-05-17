from TTS.api import TTS
import sys
import os

if len(sys.argv) < 2:
    sys.exit(1)

text = sys.argv[1]
speaker_wav = "voice/ref.wav"
output_path = "audio/tts.wav"

if not os.path.exists("audio"):
    os.makedirs("audio")

try:
    # XTTS v2 para clonagem de alta fidelidade
    tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
    tts.tts_to_file(
        text=text,
        file_path=output_path,
        speaker_wav=speaker_wav,
        language="pt"
    )
    print("TTS_OK")
except Exception as e:
    print(f"FALHA_TTS: {str(e)}")
    sys.exit(1)
