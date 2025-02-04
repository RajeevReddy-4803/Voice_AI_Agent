from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from deepgram import Deepgram
from elevenlabs import ElevenLabs
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from waitress import serve
import os
import io
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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

# Load document for LlamaIndex
try:
    documents = SimpleDirectoryReader(input_files=["document1.txt"]).load_data()
    index = VectorStoreIndex.from_documents(documents)
except Exception as e:
    app.logger.error(f"Error loading document: {str(e)}")
    index = None

# ---------------- Speech to Text Endpoint ----------------
@app.route('/stt', methods=['POST'])
async def speech_to_text_and_back():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    audio_file = request.files['file']
    audio_data = audio_file.read()

    try:
        # Deepgram transcription
        response = await dg_client.transcription.prerecorded(
            {"buffer": audio_data, "mimetype": "audio/wav"},
            {"punctuate": True, "language": "en"}
        )
        transcript = response["results"]["channels"][0]["alternatives"][0]["transcript"]
        
        # Convert the transcript to speech using ElevenLabs TTS
        audio_generator = el_client.generate(
            text=transcript,
            voice={"id": "21m00Tcm4TlvDq8ikWAM"},  # Default voice ID
            model="eleven_monolingual_v1"
        )
        audio_data = b''.join(audio_generator)

        if not audio_data:
            return jsonify({'error': 'Failed to generate audio'}), 500

        # Send back the audio response (speech)
        return Response(io.BytesIO(audio_data), mimetype="audio/mpeg")
    
    except Exception as e:
        app.logger.error(f"Speech-to-text or text-to-speech conversion failed: {str(e)}")
        return jsonify({'error': f'Speech-to-text or text-to-speech conversion failed: {str(e)}'}), 500

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

# ---------------- Process Text using LlamaIndex & LangChain ----------------
@app.route('/process-text', methods=['POST'])
def process_text():
    if index is None:
        return jsonify({"error": "LlamaIndex is not initialized properly."}), 500

    data = request.json
    user_input = data.get('text', '')

    if not user_input:
        return jsonify({"error": "No text provided"}), 400

    try:
        # LlamaIndex processing
        query_engine = index.as_query_engine()
        query_response = query_engine.query(user_input)

        # LangChain LLM processing
        prompt = PromptTemplate(
            input_variables=["input_text"],
            template="Process the following text: {input_text}"
        )
        chain = LLMChain(llm=llm, prompt=prompt)
        langchain_response = chain.run(input_text=query_response.response)

        return jsonify({
            "llama_index_response": query_response.response,
            "langchain_response": langchain_response
        })
    except Exception as e:
        app.logger.error(f"Error processing text: {str(e)}")
        return jsonify({"error": f"Text processing failed: {str(e)}"}), 500

# ---------------- Server Configuration ----------------
if __name__ == "__main__":
    app.logger.info("Starting server using Waitress...")
    serve(app, host='0.0.0.0', port=5000)
