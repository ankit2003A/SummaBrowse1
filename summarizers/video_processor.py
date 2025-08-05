import whisper
import yt_dlp

def download_audio(url, output_path='temp_audio.mp3'):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return output_path

def process_video(url):
    try:
        audio_path = download_audio(url)
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        return result['text'][:1000] + "..." if len(result['text']) > 1000 else result['text']
    except Exception as e:
        raise RuntimeError(f"Video processing failed: {str(e)}")