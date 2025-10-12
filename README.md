<!-- GHCP PROMPT TO CREATE INSTRUCTIONS.MD FOR ANY AI -->
<!-- Analyze this codebase to generate or update `.github/copilot-instructions.md` for guiding AI coding agents.

Focus on discovering the essential knowledge that would help an AI agents be immediately productive in this codebase. Consider aspects like:
- The "big picture" architecture that requires reading multiple files to understand - major components, service boundaries, data flows, and the "why" behind structural decisions
- Critical developer workflows (builds, tests, debugging) especially commands that aren't obvious from file inspection alone
- Project-specific conventions and patterns that differ from common practices
- Integration points, external dependencies, and cross-component communication patterns

Source existing AI conventions from `**/{.github/copilot-instructions.md,AGENT.md,AGENTS.md,CLAUDE.md,.cursorrules,.windsurfrules,.clinerules,.cursor/rules/**,.windsurf/rules/**,.clinerules/**,README.md}` (do one glob search).

Guidelines (read more at https://aka.ms/vscode-instructions-docs):
- If `.github/copilot-instructions.md` exists, merge intelligently - preserve valuable content while updating outdated sections
- Write concise, actionable instructions (~20-50 lines) using markdown structure
- Include specific examples from the codebase when describing patterns
- Avoid generic advice ("write tests", "handle errors") - focus on THIS project's specific approaches
- Document only discoverable patterns, not aspirational practices
- Reference key files/directories that exemplify important patterns

Update `.github/copilot-instructions.md` for the user, then ask for feedback on any unclear or incomplete sections to iterate. -->

# AIWaiter

This repository contains the code for the AIWaiter application, which includes a Node.js/Express backend and a React frontend.

## Project Structure

```
.
├── AIVoiceAgent/             # Python Gemini Voice Agent
│   ├── agents/
│   ├── prompts/
│   ├── utils/
│   ├── main.py
│   ├── requirements.txt
│   └── GEMINI.md
├── backend/                 # Node.js/Express Backend (MVP Architecture)
│   ├── models/
│   ├── views/
│   ├── presenters/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── README.md
└── frontend/                # React Frontend (Restaurant Ordering System)
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── styles/
    │   ├── utils/
    │   ├── App.jsx
    │   └── index.js
    ├── package.json
    └── README.md
```

## Setup and Running the Application

To run the full AIWaiter application, you need to set up and run both the backend and the frontend, and the AI Voice Agent.

### 1. Backend Setup

Navigate to the `backend` directory and follow its `README.md` instructions.

```bash
cd backend
npm install
# Create .env file with LIVEKIT_API_KEY, LIVEKIT_API_SECRET, PORT
npm start
```

### 2. Frontend Setup

Navigate to the `frontend` directory and follow its `README.md` instructions.

```bash
cd frontend
npm install
npm start
```

### 3. AI Voice Agent Setup

Navigate to the `AIVoiceAgent` directory and follow its `GEMINI.md` instructions.

```bash
cd AIVoiceAgent
python -m venv venv
venc\Scripts\activate
pip install -r requirements.txt
# Create .env file with LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_API_KEY
python main.py --room my-agent-room
```

## Features

### Frontend

*   Beautiful, modern UI inspired by Dine-in PetPooja.
*   Responsive design for desktop and mobile.
*   Menu display with food cards (image, title, description, price).
*   Category filters (Veg/Non-Veg, Appetizers, Main Course, etc.).
*   Shopping cart functionality (add/remove items, update quantity, running total).
*   Checkout page with order summary and form for details.
*   Order confirmation page.

### Backend

*   MVP architecture for modularity.
*   APIs for:
    *   Menu (get all, by category, by type, search, specials, item details)
    *   Orders (create, update, cancel, get status)
    *   User Favorites (get, add, remove)
    *   Calling Human Waiter
    *   LiveKit Token Generation

### AI Voice Agent

*   LiveKit-based Gemini Realtime Voice Agent.
*   Uses Gemini Realtime LLM for bi-directional voice interaction.
*   Configurable system prompt for a "polite and helpful waiter at a traditional Indian restaurant."
*   Modular structure with separate files for agents, prompts, and utilities.

---"# AIWaiter" 
# AIWaiter
