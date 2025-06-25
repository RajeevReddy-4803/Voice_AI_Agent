# Nexus Voice AI

Nexus Voice AI is a full-stack web application that demonstrates the power of modern AI services for voice and text manipulation. It provides a user-friendly interface to perform speech-to-text transcription, advanced text processing, and text-to-speech synthesis. The application is built with a React frontend and a Flask (Python) backend.

This project now includes an integration with **n8n.io** for building custom, automated text-processing workflows.

## Core Features

- **Speech-to-Text**: Real-time transcription using the browser's Web Speech API.
- **Text Processing**: Connects to a powerful backend to perform tasks like:
  - **Summarization**: Condense long-form text.
  - **Translation**: Translate text between supported languages.
  - **Text Enhancement**: General-purpose text improvement.
  - **n8n Workflow Automation**: Send text to a custom n8n webhook for limitless, user-defined processing pipelines.
- **Text-to-Speech**: (Functionality exists in backend, UI pending)
- **Multi-Language Support**: UI and processing support for English, Spanish, French, German, and Italian.
- **Responsive UI**: A clean and modern user interface built with React.

## Technology Stack

- **Frontend**: React, Vite, `react-router-dom`
- **Backend**: Python, Flask, Waitress
- **AI Services**:
  - LangChain & OpenAI (for text processing)
  - Deepgram (for backend STT)
  - ElevenLabs (for backend TTS)
- **Automation**: n8n.io (via webhooks)

---

## Project Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Python](https://www.python.org/downloads/) (v3.9 or newer)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/RajeevReddy-4803/Voice_AI_Agent.git
cd Voice_AI_Agent
```

### 2. Backend Setup

The backend powers all text processing.

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create an environment file
# Create a new file named .env and add your API keys:
```
```.env
# Required for text processing (summarize, translate, etc.)
OPENAI_API_KEY="your_openai_api_key"

# Optional: For advanced n8n workflows
N8N_WEBHOOK_URL="your_n8n_webhook_url_here"

# Optional: For backend STT/TTS
DEEPGRAM_API_KEY="your_deepgram_api_key"
ELEVENLABS_API_KEY="your_elevenlabs_api_key"
```

### 3. Frontend Setup

The frontend is the user interface you interact with in the browser.

```bash
# From the project's root directory
# (If you are in the 'backend' folder, use 'cd ..')

# Install dependencies
npm install

# Run the development server
npm run dev
```
The frontend will now be running at `http://localhost:5173`.

### 4. Running the Full Application

For the frontend to communicate with the backend, **both servers must be running at the same time.**
- **Terminal 1 (for Backend)**: Navigate to `backend` and run `python app.py`.
- **Terminal 2 (for Frontend)**: Navigate to the project root and run `npm run dev`.

---

## About This Git Repository

This repository contains the complete history of the project's development. The latest commit incorporates several major updates:

- **n8n Integration**: Added a new text processing type to send data to a configurable n8n webhook, enabling powerful automation workflows.
- **Bug Fixes**:
  - Resolved a critical CORS issue that prevented the frontend from communicating with the backend.
  - Fixed the non-functional Speech-to-Text module by implementing the Web Speech API.
  - Connected the Text Processing component to the live backend API, replacing the placeholder logic.
  - Addressed backend crashes related to unconfigured webhooks and incorrect model names.
- **Configuration**: Added a comprehensive `.gitignore` file to prevent unnecessary files (like `venv` and `node_modules`) from being added to the repository.

This work was done to address initial problems with non-functional components and to introduce intelligent task automation via n8n.

## License

This project is licensed under the ISC License.
