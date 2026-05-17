import asyncio
import logging
from pipecat.services.google.vertex.llm import GoogleVertexLLMService
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.task import PipelineTask
from pipecat.pipeline.runner import PipelineRunner
from pipecat.frames.frames import LLMMessagesAppendFrame
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair

from .manager import FormManager
from .sink import WebSocketSink
from utils import load_voice_credentials, create_voice_context
from core.config import settings

logger = logging.getLogger(__name__)

class VoiceAgentPipeline:
    def __init__(self):
        pass

    async def run(self, websocket):
        form = FormManager(websocket)
        credentials_path = load_voice_credentials()
        
        llm = GoogleVertexLLMService(
            project_id=settings.GCP_PROJECT_ID,
            location=settings.GCP_LOCATION,
            credentials_path=credentials_path,
            settings=GoogleVertexLLMService.Settings(model=settings.VERTEX_MODEL)
        )
        
        llm.register_function("update_field", form.update_field)
        llm.register_function("submit_form", form.submit_form)
        
        context = create_voice_context()
        context_aggregator = LLMContextAggregatorPair(context)
        assistant_aggregator = context_aggregator.assistant()
        
        pipeline = Pipeline([
            context_aggregator.user(),
            llm,
            assistant_aggregator,
            WebSocketSink(websocket)
        ])

        @assistant_aggregator.event_handler("on_assistant_turn_stopped")
        async def on_assistant_turn_stopped(aggregator, message):
            if message.content:
                logger.info(f"AI Response: {message.content}")
                await websocket.send_json({"type": "chat_response", "ai_response": message.content})

        task = PipelineTask(pipeline)
        pipeline_started = asyncio.Event()
        
        @task.event_handler("on_pipeline_started")
        async def on_pipeline_started(task, frame):
            pipeline_started.set()
            welcome_text = "Hello! I'm here to help you with your form submission. Can you tell me your name, phone number, and job title?"
            await websocket.send_json({"type": "welcome", "message": welcome_text})
            context.add_message({"role": "assistant", "content": welcome_text})

        async def message_handler():
            await pipeline_started.wait()
            while True:
                try:
                    msg = await websocket.receive_json()
                    if msg.get('type') == 'chat':
                        user_text = msg.get('message', '')
                        await websocket.send_json({"type": "chat_response", "user_message": user_text})
                        await task.queue_frames([
                            LLMMessagesAppendFrame(messages=[{"role": "user", "content": user_text}], run_llm=True)
                        ])
                except Exception as e:
                    logger.error(f"WebSocket error: {e}")
                    break

        runner = PipelineRunner()
        await asyncio.gather(message_handler(), runner.run(task))

def create_pipeline():
    return VoiceAgentPipeline()