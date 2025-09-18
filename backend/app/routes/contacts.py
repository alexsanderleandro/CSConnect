from fastapi import APIRouter, Depends
from typing import List
from ..schemas.user_schema import UserSchema

router = APIRouter()

# prototype in-memory users store
_users = [
    {"id": 1, "name": "Alice", "user_type": "analista", "sector_id": 1},
    {"id": 2, "name": "Bob", "user_type": "analista_admin", "sector_id": 1},
    {"id": 3, "name": "Cliente A", "user_type": "cliente", "sector_id": None}
]

@router.get('/analysts', response_model=List[UserSchema])
async def get_analysts():
    return [u for u in _users if u['user_type'].startswith('analista')]

@router.get('/clients', response_model=List[UserSchema])
async def get_clients():
    # clients only visible to admins/analysts in this prototype
    return [u for u in _users if u['user_type'] == 'cliente']
