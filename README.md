# Speech to Text, Text to Speech, and Text Processing API

This project provides APIs for the following functionalities:

1. **Speech to Text**: Converts audio input into text using the Deepgram API.
2. **Text to Speech**: Converts text input into speech using the ElevenLabs API.
3. **Text Processing**: Processes input text and generates a conversation between 3 AI voices based on provided input, using LlamaIndex and LangChain for NLP tasks.

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
