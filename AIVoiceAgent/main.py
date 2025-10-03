from dotenv import load_dotenv
import requests
import sys
from livekit import agents
from livekit.agents import AgentSession, RoomInputOptions
from livekit.plugins import google
from agents.voice_agent import VoiceAgent
from livekit.plugins import (
    noise_cancellation,
)
load_dotenv()

BASE_URL = "http://localhost:5000/api"

async def entrypoint(ctx: agents.JobContext):
    # Check if the backend is running
    try:
        response = requests.get("http://localhost:5000/health")
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Backend is not running: {e}", file=sys.stderr)
        return

    session = AgentSession()
    await session.start(
        room=ctx.room,
        agent=VoiceAgent(),
        room_input_options=RoomInputOptions(
            video_enabled=False,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )
    

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
