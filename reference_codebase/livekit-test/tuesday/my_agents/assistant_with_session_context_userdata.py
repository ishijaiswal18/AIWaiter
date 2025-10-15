from dotenv import load_dotenv

from livekit.agents import Agent, function_tool
from prompts import ASSISTANT_SYSTEM_PROMPT, ASSISTANT_SESSION_PROMPT
from tools.common import calculate, search_internet, search_web
from models.models import get_google_realtime_model

load_dotenv()

class AssistantV2(Agent):
    def __init__(self, name: str, voice: str = "Aoede") -> None:
        tools = [calculate, search_internet, search_web]
        super().__init__(
            instructions=ASSISTANT_SYSTEM_PROMPT.format(name=name),
            tools=tools,
            llm=get_google_realtime_model(voice=voice),
        )
    
    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions=ASSISTANT_SESSION_PROMPT.format(user_info=await self.get_user_info()))

    @function_tool()
    async def get_user_info(self) -> str:
        """
        Get user information from the session.
        """
        return str(self.session.userdata)
    
    @function_tool()
    async def update_user_info(self, user_name: str | None = None, age: int | None = None, location: str | None = None, favourite_website: str | None = None, favourite_food: str | None = None) -> str:
        """
        Update user information in the session.
        """
        if user_name:
            self.session.userdata.user_name = user_name
        if age:
            self.session.userdata.age = age
        if location:
            self.session.userdata.location = location
        if favourite_website:
            self.session.userdata.favourite_website = favourite_website
        if favourite_food:
            self.session.userdata.favourite_food = favourite_food
        return "User information updated."
