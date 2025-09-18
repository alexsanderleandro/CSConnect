from sqlmodel import SQLModel, Field
from typing import Optional, List

class Sector(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    linked_analysts: Optional[List[int]] = Field(default_factory=list)
