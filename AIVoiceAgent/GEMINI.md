# AI Voice Agent Documentation

This document provides a detailed overview of the AI Voice Agent, including its architecture, setup, and integration with the Gemini Realtime LLM.

## Architecture

The AI Voice Agent is built with Python using the `livekit-agents` framework. It's designed to be modular and extensible.

-   **`agents/`**: Contains the `VoiceAgent` class, which is the core of the agent. It initializes the agent, loads the system prompt, and defines the tools the agent can use.
-   **`prompts/`**: Stores the system prompt for the Gemini LLM. The prompt defines the agent's personality and capabilities.
-   **`tools/`**: Contains the function tools that the agent can use to interact with the backend API.
-   **`utils/`**: Contains utility functions, such as the configuration loader.
-   **`main.py`**: The entry point for the agent. It initializes the agent and connects to the LiveKit room.

## Setup & Run

1.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```

2.  **Activate the virtual environment:**
    ```bash
    venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the `AIVoiceAgent` directory and add the following variables:
    ```
    LIVEKIT_URL=your_livekit_url
    LIVEKIT_API_KEY=your_api_key
    LIVEKIT_API_SECRET=your_api_secret
    GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google/credentials.json
    GOOGLE_API_KEY=your_google_api_key
    ```

5.  **Run the agent:**
    ```bash
    python main.py --room my-agent-room
    ```

## Gemini Realtime LLM Integration

The agent uses the `livekit.plugins.google.LLM()` to directly integrate with the Gemini Realtime LLM. This allows for a seamless voice interaction, where the agent can listen and respond in real-time.

-   The `AgentSession` is initialized with `llm=google.LLM()`.
-   LiveKit handles the audio streaming between the user and the Gemini model.
-   The `VoiceAgent` is initialized with a system prompt that guides the model's behavior.

## Function Tools

The agent uses function tools to interact with the backend API. These tools are defined in `tools/tools.py` and are decorated with `@tool()`.

-   `get_menu()`: Fetches the full menu from the backend.
-   `get_specials()`: Fetches the daily specials from the backend.
-   `place_order(order_details)`: Places a new order.
-   `get_order_status(order_id)`: Retrieves the status of an order.

## Customization

### Modifying Agent Behavior

To modify the agent's personality and instructions, edit the `SYSTEM_PROMPT` variable in `prompts/prompts.py`.

### Adding New Tools

1.  Create an `async` function in `tools/tools.py` with the `@tool()` decorator.
2.  Add the new tool to the `tools` list in the `VoiceAgent`'s `__init__` method in `agents/voice_agent.py`.
3.  Provide a clear docstring for the tool, explaining what it does and what parameters it expects. This will help the LLM understand how to use the tool.