from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from deepgram import Deepgram
from elevenlabs import ElevenLabs
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from waitress import serve
import logging,time,os,io

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app,origins=["https://voice-ai-agent-sand.vercel.app"])

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

# Initialize API Clients
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not all([DEEPGRAM_API_KEY, ELEVENLABS_API_KEY, OPENAI_API_KEY]):
    app.logger.error("API keys are missing! Check your environment variables.")
    exit(1)

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

dg_client = Deepgram(DEEPGRAM_API_KEY)
el_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Initialize LangChain LLM
llm = ChatOpenAI(temperature=0.7, model_name="gpt-4")

# Predefined voices for different speakers
VOICE_MAP = {
    "Alice": "Xb7hH8MSUJpSbSDYk0k2",
    "Bob": "pqHfZKP75CvOlQylNhV4",
    "Charlie": "N2lVS1w4EtoT3dr4eOWO",
}



# ---------------- Speech to Text Endpoint ----------------
@app.route('/stt', methods=['POST'])
async def speech_to_text_and_back():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    audio_file = request.files['file']
    audio_data = audio_file.read()

    try:
        response = await dg_client.transcription.prerecorded(
            {"buffer": audio_data, "mimetype": "audio/wav"},
            {"punctuate": True, "language": "en"}
        )
        
        if "results" in response and "channels" in response["results"]:
            transcript = response["results"]["channels"][0]["alternatives"][0]["transcript"]
            return jsonify({'text': transcript})  # Fixing response format
        
        return jsonify({'error':'Failed to transcribe audio'}),500
    except Exception as e:
        app.logger.error(f"Speech-to-text conversion failed: {str(e)}")
        return jsonify({'error': f'Speech-to-text conversion failed: {str(e)}'}), 500

# ---------------- Text to Speech ----------------
@app.route('/tts', methods=['POST'])
def text_to_speech():
    text = request.json.get('text', '').strip()

    if not text:
        return jsonify({'error': 'Empty text'}), 400

    voice_id = "ELEVEN_LABS_VOICE_ID"  # Default voice ID (you can change it)

    try:
        # ElevenLabs text-to-speech conversion
        audio_generator = el_client.generate(
            text=text,
            voice={"id": voice_id},
            model="eleven_monolingual_v1"
        )
        audio_data = b''.join(audio_generator)

        if not audio_data:
            return jsonify({'error': 'Failed to generate audio'}), 500

        return Response(io.BytesIO(audio_data), mimetype="audio/mpeg")
    except Exception as e:
        app.logger.error(f"Text-to-speech conversion failed: {str(e)}")
        return jsonify({'error': f'Text-to-speech conversion failed: {str(e)}'}), 500

#------------------- Text Processing ------------------------------------------
@app.route('/process', methods=['POST'])
def play_conversation():
    data = request.json
    conversation = data.get("conversation", [])

    # Validate that the conversation is a list and not empty
    if not conversation or not isinstance(conversation, list):
        return jsonify({'error': 'Invalid conversation format'}), 400

    audio_clips = []
    try:
        # Iterate through the conversation entries
        for entry in conversation:
            speaker = entry.get("speaker", "Unknown")
            text = entry.get("text", "")
            
            # Check if the speaker is valid and available in the voice map
            if speaker not in VOICE_MAP:
                return jsonify({'error': f'Unknown speaker: {speaker}'}), 400
            
            voice_id = VOICE_MAP[speaker]

            # Log the speaker and text being processed
            app.logger.info(f"Generating audio for speaker: {speaker}, text: {text}")

            try:
                # Generate audio for the speaker using ElevenLabs API
                audio_generator = el_client.generate(
                    text=text,
                    voice={"id": voice_id},
                    model="eleven_monolingual_v1"
                )
                audio_data = b''.join(audio_generator)

                # If audio data is empty, return an error
                if not audio_data:
                    app.logger.error(f"Failed to generate audio for {speaker} with text: {text}")
                    return jsonify({'error': f'Failed to generate audio for {speaker}'}), 500

                # Add the generated audio data to the clips list
                audio_clips.append((speaker, audio_data))

                # Simulate a pause between speakers (1 second)
                time.sleep(1)

            except Exception as e:
                app.logger.error(f"Error generating audio for {speaker}: {str(e)}")
                return jsonify({'error': f'Failed to generate audio for {speaker}'}), 500

        # Combine all the audio clips into one response and return as audio/mpeg
        return Response(
            io.BytesIO(b"".join([clip[1] for clip in audio_clips])),
            mimetype="audio/mpeg"
        )

    except Exception as e:
        # Catch any errors that occur in the main try block
        app.logger.error(f"Conversation playback failed: {str(e)}")
        return jsonify({'error': f'Conversation playback failed: {str(e)}'}), 500

# ---------------- Server Configuration ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT not set
    app.logger.info(f"Starting server using Waitress on port {port}...")
    serve(app, host="0.0.0.0", port=port)
