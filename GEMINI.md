
# AI Voice Agent Project

This document outlines the architecture, setup, and learnings from building a LiveKit-based AI voice agent.

## Architecture

The project is structured to be modular and maintainable, inspired by the `TuesdayAgent` example.

-   `agents/`: Contains the agent classes. `voice_agent.py` defines the `VoiceAgent` class, which encapsulates the core logic of the voice agent.
-   `prompts/`: Stores system and user prompt templates. `prompts.py` contains the system prompt as a Python variable.
-   `utils/`: Contains utility functions. `config.py` handles loading configuration from environment variables.
-   `main.py`: The main entry point for the application. It initializes and runs the agent.
-   `requirements.txt`: Lists the project dependencies.
-   `GEMINI.md`: This file, containing documentation about the project.

## Setup & Run Steps

**1. Create a virtual environment:**
```bash
python -m venv venv
```

**2. Activate the virtual environment:**
```bash
venv\Scripts\activate
```

**3. Install dependencies:**
```bash
pip install -r requirements.txt
```

**4. Set up environment variables:**
Create a `.env` file in the project root and add the following variables:
```
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google/credentials.json
GOOGLE_API_KEY=your_google_api_key
```

**5. Run the agent:**
```bash
python main.py --room my-agent-room
```

## Prompt Structure

The system prompt for the Gemini LLM is now defined as a Python variable in `prompts/prompts.py`. This approach allows for more structured prompt management and potential for multiple prompts.

Example `prompts/prompts.py`:
```python
SYSTEM_PROMPT = \"\"\"
You are a polite and helpful waiter at a traditional Indian restaurant. Greet customers warmly with "Namaste!" or "Aadab!". Speak in a respectful and friendly tone. You can answer questions about our authentic Indian menu, recommend daily specials, take food orders, and confirm them. Use phrases like "ji" or "sahib/madam" appropriately when addressing customers.
\"\"\"
```

## How the Realtime Gemini Model is Being Used

Instead of separate STT (Speech-to-Text) and TTS (Text-to-Speech) pipelines, this agent directly integrates with the Gemini Realtime LLM model via `livekit.plugins.google.LLM()`.

-   The `AgentSession` is initialized with `llm=google.LLM()`. This tells LiveKit to use the Gemini Realtime model for all voice interactions.
-   LiveKit handles the bi-directional audio streaming, sending user audio to Gemini for transcription and receiving synthesized speech from Gemini for playback.
-   The `VoiceAgent` class is initialized with the system prompt, which guides the Gemini model's behavior.

## Differences from TuesdayAgent

-   **Prompt Management:** This agent now manages prompts in `prompts/prompts.py` as Python variables, similar to `TuesdayAgent`.
-   **Gemini Realtime LLM:** This agent explicitly uses the `livekit.plugins.google.LLM()` for real-time voice interaction with Gemini, rather than separate STT/TTS components.
-   **Simplified Agent Logic:** The `VoiceAgent` class is simpler as the `AgentSession` and `google.LLM()` handle the complex audio processing and LLM interaction.

## Learnings

-   The `livekit-agents` framework provides a powerful abstraction for building voice agents, especially when integrating with real-time LLMs like Gemini.
-   Proper prompt engineering is crucial for guiding the LLM's behavior.
-   Modular design (separating concerns into `agents/`, `prompts/`, `utils/`) significantly improves code readability and maintainability.

## Frontend Integration

The AI agent is integrated into a ReactJS frontend using Chakra UI. The integration is handled by a `useLiveKit` hook and a `VoiceAssistant` component.

### `useLiveKit` Hook

The `useLiveKit` hook (`frontend/src/hooks/useLiveKit.js`) encapsulates all the logic for interacting with the LiveKit room. It handles:

- **Token Generation:** Fetches an access token from the backend.
- **Room Connection:** Connects to the LiveKit room using the generated token.
- **Audio Publishing:** Publishes the user's microphone audio to the room.
- **Event Handling:** Listens for incoming audio tracks and data messages from the agent.
- **Command Handling:** Parses commands from the agent and triggers corresponding actions in the frontend (e.g., navigation, adding items to the cart).
- **Error Handling:** Uses Chakra UI's `useToast` to display error messages.

### `VoiceAssistant` Component

The `VoiceAssistant` component (`frontend/src/components/VoiceAssistant.jsx`) provides the user interface for voice interaction. It features:

- A floating microphone button that initiates the voice session.
- A modal that displays the conversation history using `ChatBubble` components.
- A button to start and stop recording the user's voice.
- An audio element to play the agent's voice responses.

### State Synchronization

The frontend state (e.g., the shopping cart) is synchronized with the AI agent through the `useLiveKit` hook. The hook receives the `cart` context and calls the appropriate functions (`addToCart`, etc.) when it receives commands from the agent.

This setup creates a seamless experience where the user can interact with the AI agent through both voice and the UI, with the agent driving the frontend application flow.

## Backend Health Check

Before the agent is started, a health check is performed to ensure that the backend server is running and available. This is done by sending a `GET` request to the `/health` endpoint. If the backend is not available, the aplication will exit with an error message.

## Past Mistakes Avoided

-   **Incorrect LLM Usage:** Previously, I attempted to use separate STT/TTS components, which is not the correct way to leverage the Gemini Realtime voice model. This version directly integrates the Gemini LLM.
-   **Missing Prompt:** The previous version lacked a system prompt, which is essential for guiding the LLM's responses. This version explicitly defines and loads a system prompt.
-   **Monolithic Script:** The previous version was a single monolithic script. This version uses a modular structure with separate files for agents, prompts, and utilities.

## Asynchronous Operations with Tools

When building tools for a `livekit-agent`, it's crucial to use asynchronous libraries for any I/O operations, such as making HTTP requests. The `livekit-agents` framework is built on Python's `asyncio`, and using synchronous (blocking) libraries like `requests` will block the agent's event loop. This would make the agent unresponsive and unable to process audio or other events in real-time.

For making HTTP requests, the recommended library is `aiohttp`. This library is asynchronous and integrates seamlessly with the `asyncio` event loop used by `livekit-agents`.

**Example:**

```python
import aiohttp
from livekit.agents.tools import tool

@tool()
async def get_data():
    async with aiohttp.ClientSession() as session:
        async with session.get('https://api.example.com/data') as response:
            return await response.text()
```

This ensures that the agent remains responsive while waiting for the HTTP request to complete.

## Debugging Audio Issues

**Date:** 2025-09-20

**Issue:** User's microphone audio is not being captured or sent to the LiveKit room. The AI agent's audio is also not being heard.

**Root Cause:** The `createLocalAudioTrack` function from the `livekit-client` library was not creating a `MediaStreamTrack`. This is because the user had not granted microphone permissions to the browser.

**Patch Summary:**
- Added a check in the `startRecording` function in `frontend/src/hooks/useLiveKit.js` to ensure that the `mediaStreamTrack` is created.
- If the `mediaStreamTrack` is not created, an error is thrown, and a toast message is displayed to the user, prompting them to grant microphone permissions.

**Recommended Prevention:**
- Always check the result of `createLocalAudioTrack` to ensure that a `MediaStreamTrack` was successfully created before attempting to publish it.
- Provide clear instructions to the user on how to grant microphone permissions.
