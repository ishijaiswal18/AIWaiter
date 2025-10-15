from livekit.agents import Agent, function_tool, RunContext
from models.models import get_google_realtime_model

class CustomerServiceAgent(Agent):
    def __init__(self, **kwargs):
        super().__init__(
            instructions="""You are a friendly customer service representative. Help customers with 
            general inquiries, account questions, and technical support. If a customer needs 
            specialized help, transfer them to the appropriate specialist.""",
            llm=get_google_realtime_model(voice="Leda"),
            chat_ctx=kwargs.get("chat_ctx", None)
        )

    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Greet the user warmly and offer your assistance.")

    @function_tool()
    async def transfer_to_billing(self, context: RunContext):
        """Transfer the customer to a billing specialist for account and payment questions."""
        return "Transferring to billing", BillingAgent(chat_ctx=self.chat_ctx)

    @function_tool()
    async def transfer_to_technical_support(self, context: RunContext):
        """Transfer the customer to technical support for product issues and troubleshooting."""
        return "Transferring to technical support", TechnicalSupportAgent(chat_ctx=self.chat_ctx)

class BillingAgent(Agent):
    def __init__(self, **kwargs):
        super().__init__(
            instructions="""You are a billing specialist. Help customers with account questions, 
            payments, refunds, and billing inquiries. Be thorough and empathetic.""",
            llm=get_google_realtime_model(voice="Aoede"),
            chat_ctx=kwargs.get("chat_ctx", None)
        )

    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Introduce yourself as a billing specialist and ask how you can help with their account.")

    @function_tool()
    async def transfer_to_technical_support(self, context: RunContext):
        """Transfer the customer to technical support for product issues and troubleshooting."""
        return "Transferring to technical support", TechnicalSupportAgent(chat_ctx=self.chat_ctx)

    @function_tool()
    async def transfer_to_customer_service(self, context: RunContext):
        """Transfer the customer back to the general customer service agent."""
        return "Transferring to customer service", CustomerServiceAgent(chat_ctx=self.chat_ctx)


class TechnicalSupportAgent(Agent):
    def __init__(self, **kwargs):
        super().__init__(
            instructions="""You are a technical support specialist. Help customers troubleshoot 
            product issues, setup problems, and technical questions. Ask clarifying questions 
            to diagnose problems effectively.""",
            llm=get_google_realtime_model(voice="Charon"),
            chat_ctx=kwargs.get("chat_ctx", None)
        )

    async def on_enter(self) -> None:
        await self.session.generate_reply(instructions="Introduce yourself as a technical support specialist and offer to help with any technical issues.")
    
    @function_tool()
    async def transfer_to_billing(self, context: RunContext):
        """Transfer the customer to a billing specialist for account and payment questions."""
        return "Transferring to billing", BillingAgent(chat_ctx=self.chat_ctx)
    
    @function_tool()
    async def transfer_to_customer_service(self, context: RunContext):
        """Transfer the customer back to the general customer service agent."""
        return "Transferring to customer service", CustomerServiceAgent(chat_ctx=self.chat_ctx)