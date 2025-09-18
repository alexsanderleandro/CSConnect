import os
from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'uploads')
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload(file: UploadFile) -> str:
    filename = file.filename
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, 'wb') as f:
        content = await file.read()
        f.write(content)
    return dest

def get_file_path(filename: str) -> str:
    p = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(p):
        return p
    return None
