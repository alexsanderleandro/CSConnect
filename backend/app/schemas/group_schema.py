from pydantic import BaseModel
from typing import Optional, List

class GroupSchema(BaseModel):
    id: Optional[int]
    name: str
    image: Optional[str]
    members: Optional[List[int]] = []

    class Config:
        orm_mode = True
