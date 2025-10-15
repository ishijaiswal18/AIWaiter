from dataclasses import dataclass

@dataclass
class UserInfo:
    user_name: str | None = None
    age: int | None = None
    location: str | None = None
    favourite_website: str | None = None
    favourite_food: str | None = None
