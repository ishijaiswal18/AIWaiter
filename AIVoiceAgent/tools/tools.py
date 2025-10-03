
import aiohttp
from livekit.agents import function_tool

BASE_URL = "http://localhost:5000"

@function_tool()
async def get_menu():
    """Get the full menu from the backend."""
    url = f"{BASE_URL}/api/menu"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

@function_tool()
async def get_specials():
    """Get today's specials from the backend."""
    url = f"{BASE_URL}/api/menu/specials"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

@function_tool()
async def place_order(order_details: dict):
    """Place an order with the provided details.
    order api accepts this format in json : {userId: 'u1', items: [{itemId: 'm1', quantity: 1}]}
    """
    url = f"{BASE_URL}/api/orders"
    print("this is order_details", order_details)
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=order_details) as response:
            return await response.text()

@function_tool()
async def get_order_status(order_id: str):
    """Get the status of an order by its ID."""
    url = f"{BASE_URL}/api/orders/{order_id}/status"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()
