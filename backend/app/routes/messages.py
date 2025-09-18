from fastapi import APIRouter, HTTPException
from typing import List
from ..schemas.message_schema import MessageSchema
from datetime import datetime

router = APIRouter()

_messages = []
_message_id_seq = 1

@router.post('/', response_model=MessageSchema)
async def post_message(msg: MessageSchema):
    global _message_id_seq
    new = msg.dict()
    new['id'] = _message_id_seq
    new['timestamp'] = datetime.utcnow()
    _message_id_seq += 1
    _messages.append(new)
    return new

@router.get('/{contact_id}', response_model=List[MessageSchema])
async def get_messages(contact_id: int):
    # return messages where contact is sender or receiver or group
    res = [m for m in _messages if m.get('sender_id') == contact_id or m.get('receiver_id') == contact_id or m.get('group_id') == contact_id]
    return res
