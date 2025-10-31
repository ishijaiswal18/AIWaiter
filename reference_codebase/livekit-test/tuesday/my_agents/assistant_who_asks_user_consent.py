from dotenv import load_dotenv

from livekit.agents import Agent, function_tool, get_job_context, RunContext
from prompts import ASSISTANT_SYSTEM_PROMPT, ASSISTANT_SESSION_PROMPT
from tools.common import calculate, search_internet, search_web
from models.models import get_google_realtime_model
from tasks.collection_consent import CollectConsent
from livekit import api
from livekit.agents import BackgroundAudioPlayer, AudioConfig, BuiltinAudioClip


load_dotenv()

class AssistantV3(Agent):
    def __init__(self, name: str, voice: str = "Aoede", is_take_consent: bool = False) -> None:
        tools = [calculate, search_internet, search_web]
        super().__init__(
            instructions=ASSISTANT_SYSTEM_PROMPT.format(name=name),
            tools=tools,
            llm=get_google_realtime_model(voice=voice),
        )
        self.background_audio = BackgroundAudioPlayer(
            ambient_sound=AudioConfig(BuiltinAudioClip.OFFICE_AMBIENCE, volume=0.8)
        )
        self.is_take_consent = False
    
    async def on_enter(self) -> None:

        # If we interrup while speaking, code moves ahead. So we wait for playout to finish.
        await self.session.generate_reply(instructions=ASSISTANT_SESSION_PROMPT.format(user_info=await self.get_user_info()))

        # NOTE. Background audio needs to be started after the session is started and agent is connected to a room.
        # Agent is connected after agent generates its first reply. This is framework limitation.
        # Otherwise, if we need session_specific background audio, we can create a background player
        # in the session.py and start it after session.start() is done. That is best practice.
        # As background audio is session specific, not agent specific.
        await self.background_audio.start(room=get_job_context().room, agent_session=self.session)

        if self.is_take_consent:        
            speech_handle = self.session.generate_reply(instructions="""
                                            Inform user that your partner will now take over the call for 
                                            consent collection purpose.
                                            """)
            await speech_handle.wait_for_playout()
            if await CollectConsent(chat_ctx=self.chat_ctx):
                await self.session.generate_reply(instructions="Tell user you are back and Offer your assistance to the user.")
            else:
                await self.session.generate_reply(instructions="Inform the user that you are unable to proceed and will end the call.")
                # End the call if consent is not given - This will fail in console mode since there is no room to delete
                job_ctx = get_job_context()
                await job_ctx.api.room.delete_room(api.DeleteRoomRequest(room=job_ctx.room.name))

    @function_tool()
    async def collect_consent(self) -> bool:
        """
        Collect user consent for recording the call.
        """
        return await CollectConsent(chat_ctx=self.chat_ctx)

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
    
    @function_tool()
    async def change_ambiance(self, ambiance: str, ctx: RunContext) -> str:
        """
        This Tool Changes the background ambiance.
        ambiance: str = The ambiance to change to.
        Possible values: "office", "keyboard"
        """
        if self.background_audio:
            await self.background_audio.aclose()
        
        if ambiance == "office":
            audio = AudioConfig(BuiltinAudioClip.OFFICE_AMBIENCE, volume=0.8)
        elif ambiance == "keyboard":
            audio = AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=0.8)
        else:
            return "Invalid ambiance option."

        self.background_audio = BackgroundAudioPlayer(
            ambient_sound=audio
        )
        await self.background_audio.start(room=get_job_context().room, agent_session=self.session)
        return f"Background ambiance changed to {ambiance}."
