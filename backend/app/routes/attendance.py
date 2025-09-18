from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.attendance_schema import AttendanceSchema

router = APIRouter()

_queue = []
_queue_seq = 1

@router.post('/', response_model=AttendanceSchema)
async def create_attendance(item: AttendanceSchema):
    global _queue_seq
    new = item.dict()
    new['id'] = _queue_seq
    _queue_seq += 1
    _queue.append(new)
    # In production: notify linked analysts
    return new

@router.post('/transfer')
async def transfer_attendance(attendance_id: int, to_analyst: int):
    for q in _queue:
        if q['id'] == attendance_id:
            q['assigned_analyst'] = to_analyst
            q['status'] = 'transferred'
            return {"ok": True}
    raise HTTPException(status_code=404, detail='Attendance not found')

@router.post('/finalize')
async def finalize_attendance(attendance_id: int, satisfaction: int = 5):
    for q in _queue:
        if q['id'] == attendance_id:
            q['status'] = 'finalized'
            q['satisfaction'] = satisfaction
            # SEND EMAIL: in real implementation
            return {"ok": True}
    raise HTTPException(status_code=404, detail='Attendance not found')
