from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import contacts, messages, groups, sectors, attendance

app = FastAPI(title="CSCollect Messaging API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(sectors.router, prefix="/sectors", tags=["sectors"])
app.include_router(attendance.router, prefix="/attendance", tags=["attendance"])

@app.get('/')
async def root():
    return {"status": "ok", "service": "cscollect messaging"}
