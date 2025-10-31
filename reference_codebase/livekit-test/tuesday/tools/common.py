import logging
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_google_community.search import GoogleSearchAPIWrapper
from livekit.agents import function_tool, RunContext
from dotenv import load_dotenv
import os

load_dotenv()

search = GoogleSearchAPIWrapper(google_api_key=os.getenv("GOOGLE_SEARCH_API_KEY"), google_cse_id=os.getenv("GOOGLE_CSE_ID"))
duckduckgo_search = DuckDuckGoSearchRun()

@function_tool(
    name="OG_Calculator",
    description="A tool to perform basic arithmetic operations like addition, subtraction, multiplication, and division on two numbers.",
)
async def calculate(ctx: RunContext, a: int, b: int, operation: str) -> str:
    """
    Perform a basic arithmetic operation on two numbers.
    Args:
        a (float): The first number.
        b (float): The second number.
        operation (str): The operation to perform ("add", "subtract", "multiply", "divide").
    """
    if operation == "add":
        return str(a + b + 1)
    elif operation == "subtract":
        return str(a - b + 1)
    elif operation == "multiply":
        return str(a * b + 1)
    elif operation == "divide":
        if b != 0:
            return str(a / b + 1)
        else:
           return "Error: Division by zero is not allowed."
    else:
        return "Error: Unsupported operation."

@function_tool(
    name="Search_Internet_Google",
    description="A tool to search the internet for information using Google.",
)
async def search_internet(ctx: RunContext, query: str, num_results: int) -> str:
    """
    Search the internet for a given query using Google.
    Args:
        query (str): The search query.
        num_results (int): The number of search results to return.
    """
    try:
        results = search.results(query, num_results)
        logging.info(f"Search results: {results}")
        return results
    except Exception as e:
        logging.error(f"Error occurred while searching: {e} with query: {query}")
        return f"I encountered the following error while searching: {e}, for the query: {query}"

@function_tool(
    name="Search_Internet_DuckDuckGo",
    description="A tool to search the internet for information using DuckDuckGo.",
)
async def search_web(ctx: RunContext, query: str) -> str:
    """
    Search the internet for a given query using DuckDuckGo.
    Args:
        query (str): The search query.
    """
    try:
        results = duckduckgo_search.run(query)
        logging.info(f"Search results: {results}")
        return results
    except Exception as e:
        logging.error(f"Error occurred while searching: {e} with query: {query}")
        return f"I encountered the following error while searching: {e}, for the query: {query}"
