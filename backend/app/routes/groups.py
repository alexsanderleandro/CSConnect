from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.group_schema import GroupSchema

router = APIRouter()

_groups = []
_group_seq = 1

@router.post('/', response_model=GroupSchema)
async def create_group(group: GroupSchema):
    global _group_seq
    new = group.dict()
    new['id'] = _group_seq
    _group_seq += 1
    _groups.append(new)
    return new

@router.put('/{id}', response_model=GroupSchema)
async def update_group(id: int, group: GroupSchema):
    for i, g in enumerate(_groups):
        if g['id'] == id:
            ng = g.copy()
            ng.update(group.dict(exclude_unset=True))
            _groups[i] = ng
            return ng
    raise HTTPException(status_code=404, detail='Group not found')

@router.delete('/{id}')
async def delete_group(id: int):
    for i, g in enumerate(_groups):
        if g['id'] == id:
            _groups.pop(i)
            return {"ok": True}
    raise HTTPException(status_code=404, detail='Group not found')
