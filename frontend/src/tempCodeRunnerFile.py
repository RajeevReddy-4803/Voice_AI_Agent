
from langchain.embeddings import OpenAIEmbeddings
from llama_index import StorageContext, load_index_from_storage, VectorStoreIndex, SimpleDocument

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Initialize APIs
dg_client = Deepgram(os.getenv('DEEPGRAM_API_KEY'))
elevenlabs.set_api_key(os.getenv('ELEVENLABS_API_KEY'))

# LangChain setup
prompt = PromptTemplate(
    input_variables=["query"],
    template="You are a helpful AI assistant. Respond to the following query in a friendly and informative manner:\n{query}"
)

llm = ChatOpenAI(model_name="gpt-4", temperature=0)
llm_chain = LLMChain(llm=llm, prompt=prompt)

# LlamaIndex setup
storage_context = StorageContext.from_defaults(persist_dir="./storage")
index = load_index_from_storage(storage_context)

# FAISS VectorStore setup
embeddings = OpenAIEmbeddings()
vector_store = FAISS.load_local("faiss_index", embeddings)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever()
)

# ---------------------- ROUTES ----------------------

# Speech-to-Text (STT) endpoint
@app.route('/stt', methods=['POST'])
def stt():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    audio_file = request.files['file']
    
    try:
        response = dg_client.transcription.prerecorded(
            {'buffer': audio_file.read()},
            {'punctuate': True, 'language': 'en'}
        )
        transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
        return jsonify({'text': transcript})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Text Processing endpoint
@app.route('/process', methods=['POST'])
def process():
    data = request.json
    query = data.get('text', '')

    if not query:
        return jsonify({'error': 'Empty query'}), 400

    try:
        # Use LangChain for text processing
        processed_text = llm_chain.run(query)

        # Store interaction in LlamaIndex
        doc = SimpleDocument(text=f"Query: {query}\nResponse: {processed_text}")
        index.insert_documents([doc])

        return jsonify({'processedText': processed_text})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Text-to-Speech (TTS) endpoint
@app.route('/tts', methods=['POST'])
def tts():
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'Empty text'}), 400

    try:
        # Generate audio using Eleven Labs
        audio_url = elevenlabs.generate(text=text, voice="Bella", stream=False)
        return jsonify({'audioUrl': audio_url})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
