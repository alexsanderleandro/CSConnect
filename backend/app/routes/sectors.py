from fastapi import APIRouter
from typing import List
from ..schemas.sector_schema import SectorSchema

router = APIRouter()

_sectors = [
    {"id": 1, "name": "Suporte", "linked_analysts": [1,2]},
    {"id": 2, "name": "Vendas", "linked_analysts": [2]}
]

@router.get('/', response_model=List[SectorSchema])
async def get_sectors():
    return _sectors
