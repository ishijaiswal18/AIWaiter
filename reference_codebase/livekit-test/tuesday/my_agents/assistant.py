from dotenv import load_dotenv

from livekit.agents import Agent
from livekit.plugins import (
    google,
)
from prompts import ASSISTANT_SYSTEM_PROMPT, ASSISTANT_SESSION_PROMPT
from tools.common import calculate, search_internet, search_web
from models.models import get_google_realtime_model

load_dotenv()

class Assistant(Agent):
    def __init__(self, name: str, voice: str = "Aoede") -> None:
        tools = [calculate, search_internet, search_web]
        super().__init__(
            instructions=ASSISTANT_SYSTEM_PROMPT.format(name=name),
            tools=tools,
            llm=get_google_realtime_model(voice=voice),
        )
    
    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions=ASSISTANT_SESSION_PROMPT.format(user_info=""))
