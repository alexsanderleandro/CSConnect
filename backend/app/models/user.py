from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    user_type: str  # 'analista', 'cliente', 'analista_admin'
    sector_id: Optional[int] = Field(default=None, foreign_key="sector.id")

    # relationships (backrefs)
    # groups: List["Group"] = Relationship(back_populates="members")
