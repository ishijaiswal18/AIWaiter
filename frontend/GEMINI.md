# AIWaiter Frontend Documentation

This document provides a detailed overview of the AIWaiter frontend, including its architecture, setup, and key components.

## Architecture

The frontend is a single-page application (SPA) built with **React** and **Vite**. It uses **Chakra UI** for styling and component-based design.

The application is structured as follows:

-   **`components/`**: Contains reusable UI components (e.g., `MenuItemCard`, `ChatBubble`).
-   **`context/`**: Contains React context providers for managing global state (e.g., `CartContext`).
-   **`hooks/`**: Contains custom React hooks for encapsulating complex logic (e.g., `useLiveKit`, `useMenu`).
-   **`pages/`**: Contains the main pages of the application (e.g., `HomePage`, `MenuPage`).
-   **`services/`**: Contains functions for making API calls to the backend.
-   **`theme/`**: Contains the Chakra UI theme configuration.

## Setup & Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Key Components

-   **`VoiceAssistant`**: The main component for interacting with the AI voice agent. It handles the microphone button, the conversation modal, and the audio playback.
-   **`useLiveKit`**: A custom hook that encapsulates all the logic for interacting with the LiveKit room. It handles token generation, room connection, audio publishing, and event handling.
-   **`CartContext`**: A React context that provides a global state for the shopping cart. It allows components to access and modify the cart from anywhere in the application.

## LiveKit Integration

The frontend integrates with the AI voice agent via a WebSocket connection to a LiveKit room. The `useLiveKit` hook manages this connection and handles the following:

-   **Token Generation:** Fetches an access token from the backend.
-   **Room Connection:** Connects to the LiveKit room using the generated token.
-   **Audio Publishing:** Publishes the user's microphone audio to the room.
-   **Event Handling:** Listens for incoming audio tracks and data messages from the agent.
-   **Command Handling:** Parses commands from the agent and triggers corresponding actions in the frontend (e.g., navigation, adding items to the cart).
