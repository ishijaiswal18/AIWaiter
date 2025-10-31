from dotenv import load_dotenv
import os

from livekit import agents, api
from livekit.agents import AgentSession, RoomInputOptions, mcp
from livekit.plugins import (
    noise_cancellation,
)
from my_agents.assistant_with_session_context_userdata import AssistantV2
from my_agents.multi_agent_example import CustomerServiceAgent
from my_agents.assistant_who_asks_user_consent import AssistantV3
from session_states.user_info import UserInfo
from models.models import get_google_realtime_model

load_dotenv()

async def entrypoint(ctx: agents.JobContext):
    
    # NOTE:
    # In Realtime Modles, turn-detection is at server side by default i.e. at Gemini / LLM side.
    # Hence, Livekit Agent Session cannot stop interruptions in the middle of the agent's speech.
    # If we want to use allow_interruptions=False, we need to set turn_detection = VAD or STT or something
    # And provide the VAD / STT model to the session.
    # This allow interruptsions, can also be used with specific mesages (Like when using generate_reply to
    # get the agent to say something specific).
    # Very useful, might need a VAD to allow this feature.
    
    req = api.RoomCompositeEgressRequest(
        room_name=ctx.room.name,
        # audio_only=True,
        file_outputs=[api.EncodedFileOutput(
            file_type=api.EncodedFileType.MP4,
            filepath="livekit/my-room-test.mp4",
            s3=api.S3Upload(
                bucket=os.environ["DIGITAL_OCEAN_BUCKET_NAME"],
                region=os.environ["DIGITAL_OCEAN_BUCKET_REGION"],
                access_key=os.environ["DIGITAL_OCEAN_ACCESS_KEY_ID"],
                secret=os.environ["DIGITAL_OCEAN_SECRET_ACCESS_KEY"],
                endpoint=os.environ["DIGITAL_OCEAN_BUCKET_ENDPOINT"]
            ),
        )],
    )
    
    lkapi = api.LiveKitAPI()
    res = await lkapi.egress.start_room_composite_egress(req)
    await lkapi.aclose()
    
    session = AgentSession[UserInfo](
        allow_interruptions=True,
        llm=get_google_realtime_model(voice="Fenrir"),
        userdata=UserInfo(
            user_name="John Doe",
            age="25",
            location="America",
            favourite_website="Quora",
            favourite_food="Pizza"
        ),
        # mcp_servers=[
        #     mcp.MCPServerHTTP(
        #         "https://huggingface.co/mcp",
        #     )
        # ]
    )
    
    await session.start(
        room=ctx.room,
        agent=AssistantV3("Tuesday", "Leda"),
        # agent=CustomerServiceAgent(),
        room_input_options=RoomInputOptions(
            # For telephony applications, use `BVCTelephony` instead for best results
            video_enabled=True,
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name="Tuesday"
    ))
