from sqlmodel import SQLModel, Field
from typing import Optional, List

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    image: Optional[str] = None
    members: Optional[List[int]] = Field(default_factory=list)
