from pydantic import BaseModel
from typing import Optional

class UserSchema(BaseModel):
    id: Optional[int]
    name: str
    user_type: str
    sector_id: Optional[int]

    class Config:
        orm_mode = True
