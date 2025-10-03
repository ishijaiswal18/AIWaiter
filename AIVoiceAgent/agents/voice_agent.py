import asyncio
from livekit import agents
from livekit.agents.llm import ChatContext, ChatMessage
from prompts.prompts import SYSTEM_PROMPT
from models.models import get_google_realtime_model
from tools.tools import get_menu, get_specials, place_order, get_order_status

class VoiceAgent(agents.Agent):

    def __init__(self, voice: str = "Aoede") -> None:
        tools = [get_menu, get_specials, place_order, get_order_status]
        super().__init__(
            instructions=SYSTEM_PROMPT,
            tools=tools,
            llm=get_google_realtime_model(voice=voice),
        )
    
    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Say Hello to customer")

    async def on_connected(self):
        print("VoiceAgent connected to room.")
        # The agent will automatically start listening and generating responses
        # based on the LLM provided in AgentSession.
        # We can send an initial message if needed
        # await self.session.generate_reply(instructions="Hello, how can I help you today?")