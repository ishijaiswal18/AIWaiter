from livekit.agents import AgentTask, function_tool, RunContext, ToolError
from models.models import get_google_realtime_model
from livekit.agents.voice import SpeechHandle

class CollectConsent(AgentTask[bool]):
    def __init__(self, chat_ctx) -> None:
        super().__init__(
            instructions="""
            Ask for recording consent and get a clear yes or no answer.
            Once consent is given or denied, confirm the consent and update if needed and then consent again.
            Once consent is confirmed, tell the user that you are now going away and the original agent will return.
            """,
            chat_ctx=chat_ctx,
            # In case we dont pass a specific llm, it will use the AgentSession's default llm
            # llm=get_google_realtime_model(voice="Fenrir"),
            # Can provide separate tools if needed
            # tools=[],
        )
        
        self.consent_state: bool | None = None
        
        # Used to handle hallucination where agent itself confirms the consent state.
        self.consent_output_speech_handle: SpeechHandle | None = None

    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Ask for permission to record the call for quality assurance purposes.")

    @function_tool
    async def consent_given(self, ctx: RunContext) -> None:
        """Use this when the user gives consent to record."""
        self.consent_state = True
        self.consent_output_speech_handle = ctx.speech_handle

    @function_tool
    async def consent_denied(self, ctx: RunContext) -> None:
        """Use this when the user denies consent to record."""
        self.consent_state = False
        self.consent_output_speech_handle = ctx.speech_handle
        
    @function_tool
    async def confirm_consent_state(self, ctx: RunContext) -> bool | None:
        """Use this to confirm the current consent state."""
        
        await ctx.wait_for_playout()

        if self.consent_state is None:
            raise ToolError("error: consent state is not set, use `consent_given` or `consent_denied` first")
        
        # Check for hallucination - if the tool is called from the same speech handle as the last output, ignore it
        if self.consent_output_speech_handle == ctx.speech_handle:
            raise ToolError("error: the user must confirm the consent state explicitly")
        
        return self.complete(self.consent_state)
