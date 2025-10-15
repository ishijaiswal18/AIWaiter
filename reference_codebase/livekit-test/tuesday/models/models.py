from livekit.plugins import (
    google,
)
def get_google_realtime_model(voice: str) -> google.beta.realtime.RealtimeModel:
    return google.beta.realtime.RealtimeModel(
        voice=voice,
        temperature=0.8,
        language="en-US",
    )
