import logging
from pipecat.frames.frames import Frame, EndFrame
from pipecat.processors.frame_processor import FrameProcessor, FrameDirection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketSink(FrameProcessor):
    def __init__(self, websocket):
        super().__init__()
        self.websocket = websocket

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
            
        await self.push_frame(frame, direction)
        
        logger.info(f"WebSocketSink received frame: {type(frame).__name__}")
        
        if hasattr(frame, "error") or "error" in type(frame).__name__.lower():
            logger.error(f"ERROR FRAME IN PIPELINE: {frame} (type: {type(frame).__name__})")
        elif isinstance(frame, EndFrame):
            logger.info("Pipeline session ended")