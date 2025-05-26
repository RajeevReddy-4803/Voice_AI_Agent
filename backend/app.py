from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from deepgram import Deepgram
from elevenlabs import ElevenLabs
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from waitress import serve
import logging, time, os, io
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["https://voice-ai-agent-phi.vercel.app", "https://voice-ai-agent.onrender.com"])

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("Nexus Voice AI")

# Initialize API Clients
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([DEEPGRAM_API_KEY, ELEVENLABS_API_KEY, OPENAI_API_KEY]):
    logger.error("API keys are missing! Check your environment variables.")
    exit(1)

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

dg_client = Deepgram(DEEPGRAM_API_KEY)
el_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Initialize LangChain LLM with optimized settings
llm = ChatOpenAI(
    temperature=0.7,
    model_name="gpt-4",
    max_tokens=1000,
    request_timeout=30
)

# Supported languages with their display names and flags
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "flag": "🇺🇸"},
    "es": {"name": "Spanish", "flag": "🇪🇸"},
    "fr": {"name": "French", "flag": "🇫🇷"},
    "de": {"name": "German", "flag": "🇩🇪"},
    "it": {"name": "Italian", "flag": "🇮🇹"}
}

# Predefined voices for different speakers with language support
VOICE_MAP = {
    "Alice": {
        "en": "Xb7hH8MSUJpSbSDYk0k2",  # Professional female voice
        "es": "pqHfZKP75CvOlQylNhV4",  # Spanish female voice
        "fr": "N2lVS1w4EtoT3dr4eOWO",  # French female voice
        "de": "Xb7hH8MSUJpSbSDYk0k2",  # German female voice
        "it": "pqHfZKP75CvOlQylNhV4"   # Italian female voice
    },
    "Bob": {
        "en": "pqHfZKP75CvOlQylNhV4",  # Professional male voice
        "es": "N2lVS1w4EtoT3dr4eOWO",  # Spanish male voice
        "fr": "Xb7hH8MSUJpSbSDYk0k2",  # French male voice
        "de": "pqHfZKP75CvOlQylNhV4",  # German male voice
        "it": "N2lVS1w4EtoT3dr4eOWO"   # Italian male voice
    }
}

# Thread pool for concurrent processing
executor = ThreadPoolExecutor(max_workers=10)

# Cache for frequently used responses
@lru_cache(maxsize=100)
def get_cached_tts(text, voice_id):
    return el_client.generate(
        text=text,
        voice={"id": voice_id},
        model="eleven_multilingual_v2"
    )

# ---------------- Health Check Endpoint ----------------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Nexus Voice AI',
        'version': '1.0.0',
        'supported_languages': SUPPORTED_LANGUAGES
    })

# ---------------- Speech to Text Endpoint ----------------
@app.route('/api/stt', methods=['POST'])
async def speech_to_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['file']
    language = request.form.get('language', 'en')
    
    if language not in SUPPORTED_LANGUAGES:
        return jsonify({
            'error': 'Unsupported language',
            'supported_languages': SUPPORTED_LANGUAGES
        }), 400

    try:
        audio_data = audio_file.read()
        response = await dg_client.transcription.prerecorded(
            {"buffer": audio_data, "mimetype": "audio/wav"},
            {
                "punctuate": True,
                "language": language,
                "model": "nova-2",
                "smart_format": True,
                "diarize": True
            }
        )
        
        if "results" in response and "channels" in response["results"]:
            transcript = response["results"]["channels"][0]["alternatives"][0]["transcript"]
            confidence = response["results"]["channels"][0]["alternatives"][0]["confidence"]
            
            return jsonify({
                'text': transcript,
                'confidence': confidence,
                'language': language,
                'language_name': SUPPORTED_LANGUAGES[language]['name'],
                'language_flag': SUPPORTED_LANGUAGES[language]['flag']
            })
        else:
            logger.error(f"Transcription response format is incorrect: {response}")
            return jsonify({'error': 'Transcription failed'}), 500

    except Exception as e:
        logger.error(f"Error processing speech-to-text: {str(e)}")
        return jsonify({'error': 'Speech-to-text conversion failed'}), 500

# ---------------- Text to Speech Endpoint ----------------
@app.route('/api/tts', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text', '').strip()
    language = data.get('language', 'en')
    voice_id = data.get('voice_id', VOICE_MAP['Alice'][language])

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    try:
        audio_generator = get_cached_tts(text, voice_id)
        audio_data = b''.join(audio_generator)

        if not audio_data:
            return jsonify({'error': 'Failed to generate audio'}), 500

        return Response(
            io.BytesIO(audio_data),
            mimetype="audio/mpeg",
            headers={
                'Content-Disposition': 'attachment; filename=nexusvoice_audio.mp3'
            }
        )
    except Exception as e:
        logger.error(f"Text-to-speech conversion failed: {str(e)}")
        return jsonify({'error': 'Text-to-speech conversion failed'}), 500

# ---------------- Text Processing Endpoint ----------------
@app.route('/api/process', methods=['POST'])
def process_text():
    data = request.json
    text = data.get('text', '').strip()
    language = data.get('language', 'en')
    processing_type = data.get('type', 'summarize')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    if language not in SUPPORTED_LANGUAGES:
        return jsonify({
            'error': 'Unsupported language',
            'supported_languages': SUPPORTED_LANGUAGES
        }), 400

    try:
        # Process text based on type
        if processing_type == 'summarize':
            prompt = f"Summarize the following text in {SUPPORTED_LANGUAGES[language]['name']}:\n\n{text}"
        elif processing_type == 'translate':
            prompt = f"Translate the following text to {SUPPORTED_LANGUAGES[language]['name']}:\n\n{text}"
        else:
            prompt = f"Process the following text in {SUPPORTED_LANGUAGES[language]['name']}:\n\n{text}"

        response = llm.invoke(prompt)
        processed_text = response.content

        return jsonify({
            'original_text': text,
            'processed_text': processed_text,
            'language': language,
            'language_name': SUPPORTED_LANGUAGES[language]['name'],
            'language_flag': SUPPORTED_LANGUAGES[language]['flag'],
            'processing_type': processing_type
        })

    except Exception as e:
        logger.error(f"Text processing failed: {str(e)}")
        return jsonify({'error': 'Text processing failed'}), 500

# ---------------- Server Configuration ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting Nexus Voice AI server on port {port}...")
    serve(app, host="0.0.0.0", port=port, threads=16)
