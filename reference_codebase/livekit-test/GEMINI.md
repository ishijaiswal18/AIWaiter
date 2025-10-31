# LiveKit Agents Learnings

This file documents my learnings about the LiveKit Agents framework.

## Core Concepts

- **LiveKit Agents Framework**: A framework for building voice AI applications. It simplifies development by providing abstractions while allowing full control over the code.
- **`AgentSession`**: The core of a LiveKit voice AI app. It manages user input, the voice pipeline, LLM invocation, and output.
- **`Agent`**: Defines the AI's logic, such as instructions and tools. Each session uses at least one `Agent`.
- **`RoomIO`**: A utility class that manages media streams (primarily audio) between the `AgentSession` and the LiveKit room. It handles audio track subscriptions by default.
- **Providers**: LiveKit Agents allows using various providers for different parts of the voice pipeline:
    - **STT (Speech-to-Text)**
    - **LLM (Large Language Models)**
    - **TTS (Text-to-Speech)**
- **Advanced Capabilities**:
    - **Workflows**: Orchestrate complex tasks among multiple agents.
    - **Tool definition & use**: Integrate external services.
    - **Pipeline nodes**: Add custom behaviors to the voice pipeline.

## Project Structure for Interviewer Agent

- `interviewer/`
    - `.env`: Contains environment variables for LiveKit API keys and Google API keys.
    - `main.py`: The entry point for the application, responsible for setting up the `AgentSession` and starting the interview.
    - `prompts.py`: Defines the system and session prompts for the interviewer agent.
    - `interviewer_agent.py`: Implements the core logic of the interviewer agent, including its persona, tools, and interview flow.
    - `models.py`: Contains functions to get the Google Realtime LLM model.
    - `tools/`
        - `common.py`: (Currently empty, but can be used for common utility functions or tools).
    - `data/`
        - `resume.txt`: A placeholder for the user's resume, which the interviewer agent will use to ask questions.

## Current Status

The LiveKit interviewer agent project is now complete, fulfilling the requirements for a structured, timed, and resume-based interview. The `interviewer_agent.py` file has been updated to include:

-   **Interview State Management**: Tracks the current phase of the interview (Introduction, Technical, Behavioral, Conclusion).
-   **Time Management**: Implements a timer to keep track of the remaining time for each phase and the overall interview (20 minutes total).
-   **Structured Interview Flow**: The agent now guides the user through:
    1.  **Introduction Phase**: Introduces itself and explains the interview process.
    2.  **Technical Questions Phase**: Reads the user's resume and generates technical questions based on its content. (Note: The LLM's ability to generate relevant questions depends on the quality of the prompt and the LLM itself).
    3.  **Behavioral Questions Phase**: Asks behavioral questions.
    4.  **Conclusion Phase**: Wraps up the interview, asks for user questions, and explains next steps.
-   **Enhanced Tools**: Added `get_remaining_interview_time` and `get_remaining_phase_time` tools for the agent to use internally.
-   **Semantic Turn Detection**: Integrated `livekit-plugins-turn-detector` and Deepgram STT to enable natural conversation flow by accurately detecting when the user has finished speaking. This replaces fixed `asyncio.sleep` calls with `self.session.wait_for_user_turn()`.

## How to Run

To run the interviewer agent:

1.  **Navigate to the `interviewer` directory**:
    ```bash
    cd C:\Users\anmol\Desktop\Coding\LiveKitProjects\Vision\interviewer
    ```
2.  **Install dependencies**: You will need to install `livekit-agents`, `python-dotenv`, and `livekit-plugins` (specifically for Deepgram and Turn Detector).
    ```bash
    pip install "livekit-agents" "livekit-plugins-deepgram" "livekit-plugins-turn-detector"
    ```
3.  **Run the agent**: Make sure your LiveKit server is running and accessible via the `LIVEKIT_URL` in your `.env` file. Make sure you have a Deepgram API key set as `DEEPGRAM_API_KEY` in your environment variables or `.env` file.
    ```bash
    python main.py
    ```

This will start the agent, and it will be ready to join a LiveKit room. You can then connect to the room using a LiveKit client (e.g., a web client or another agent) to interact with it.