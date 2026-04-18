# Humanized Text

Humanized Text is a Chrome extension that rewrites AI-generated writing into more natural, human-sounding text. It uses a Node.js backend with Groq to detect the tone of the input and generate a rewritten version that preserves meaning while improving flow, sentence variety, and readability.

## Features

- Chrome side panel UI for quick text humanization
- Tone detection before rewriting so the output matches the input style
- Humanized output with preserved meaning and improved naturalness
- Copy button for fast reuse of the converted text
- Local backend API built with Express and Groq

## Project Structure

```
humanize-extension/
├── backend/        # Express API that calls Groq
└── extension/      # Chrome extension UI and messaging logic
```

## Requirements

- Node.js 18 or newer
- Google Chrome
- A Groq API key

## Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a file named `.env` inside the `backend/` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

> Do not commit your `.env` file.

### 3. Start the backend

```bash
cd backend
node server.js
```

The backend starts on `http://localhost:3000` by default.

### 4. Load the Chrome extension

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click **Load unpacked**
4. Select the `extension/` folder

## Usage

1. Start the backend server.
2. Open the Chrome extension side panel.
3. Paste AI-generated text into the input box.
4. Click **Humanize**.
5. Copy the converted text using the **Copy** button.

## How It Works

1. The extension sends the input text to the backend.
2. Agent 1 detects the tone of the input.
3. Agent 2 rewrites the text while preserving that tone.
4. The rewritten text is returned to the extension and shown in the side panel.

## API Endpoint

### `POST /humanize`

Request body:

```json
{
  "text": "Your input text here"
}
```

Response:

```json
{
  "humanized": "Rewritten text",
  "original": "Original text",
  "tone": {
    "tone": "formal",
    "confidence": 0.9
  }
}
```

## Troubleshooting

- If the extension shows an error, confirm the backend is running.
- If requests fail, verify `GROQ_API_KEY` is set correctly in `backend/.env`.
- If the extension cannot connect, make sure the backend is listening on the expected port.
- Reload the extension after making any changes in the `extension/` folder.

## Notes

- The backend is currently configured for local development using `http://localhost:3000`.
- If you deploy the backend, update the API URL in the extension to match the hosted endpoint.
