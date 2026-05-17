from fastapi import APIRouter, WebSocket
from services import create_pipeline

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    pipeline = create_pipeline()
    await pipeline.run(ws)