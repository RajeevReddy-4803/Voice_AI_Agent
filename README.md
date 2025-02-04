# Speech to Text, Text to Speech, and Text Processing API

This project includes the following functionality:

1. **Speech to Text**: Converts audio input to text using Deepgram API.
2. **Text to Speech**: Converts text input into speech using ElevenLabs API.
3. **Text Processing**: Processes input text using LlamaIndex and LangChain for NLP tasks.

### Setup Instructions

1. Clone this repository
2. Create a `.env` file to store your API keys (Deepgram, ElevenLabs, OpenAI).
3. Install required dependencies: `pip install -r requirements.txt`.
4. Run the server using `python app.py`.

### Dependencies

- Flask
- Deepgram
- ElevenLabs
- LangChain
- OpenAI
- LlamaIndex
- dotenv
- waitress
