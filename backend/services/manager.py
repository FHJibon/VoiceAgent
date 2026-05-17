import uuid
import logging
from .database import db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FormManager:
    def __init__(self, websocket):
        self.websocket = websocket
        self.data = {'name': '', 'phone': '', 'jobTitle': ''}
        self.session_id = str(uuid.uuid4())
        self.is_submitted = False

    async def update_field(self, *args, **kwargs):
        logger.info(f"update_field called with args: {args}, kwargs: {kwargs}")
        
        field = kwargs.get("field")
        value = kwargs.get("value")
        result_callback = None
        
        first_arg = args[0] if args else None
        if first_arg:
            if hasattr(first_arg, 'arguments') and isinstance(first_arg.arguments, dict):
                field = first_arg.arguments.get("field")
                value = first_arg.arguments.get("value")
            if hasattr(first_arg, 'result_callback'):
                result_callback = first_arg.result_callback
            
            if isinstance(first_arg, dict):
                field = first_arg.get("field")
                value = first_arg.get("value")
        
        if not field or not value:
            for arg in args:
                if isinstance(arg, dict):
                    field = field or arg.get("field")
                    value = value or arg.get("value")
                    
        if not field or not value:
            if "args" in kwargs and isinstance(kwargs["args"], dict):
                field = kwargs["args"].get("field")
                value = kwargs["args"].get("value")

        logger.info(f"Extracted field: {field}, value: {value}")

        result_str = ""
        if field in self.data:
            self.data[field] = value
            db.save_form_session(self.session_id, self.data, "in_progress")
            
            await self.websocket.send_json({
                "type": "form_update",
                "field": field,
                "value": value
            })
            
            logger.info(f"Updated {field} to {value}")
            missing = [k for k, v in self.data.items() if not v]
            if missing:
                result_str = f"Successfully updated {field} to {value}. Remaining missing fields that you MUST ask the user for: {', '.join(missing)}."
            else:
                result_str = f"Successfully updated {field} to {value}. All fields (name, phone, jobTitle) are now successfully collected! You must now call the 'submit_form' tool."
        else:
            result_str = f"Error: Field {field} not found."
            
        if result_callback:
            await result_callback(result_str)
        return result_str

    async def submit_form(self, *args, **kwargs):
        logger.info(f"submit_form called with args: {args}, kwargs: {kwargs}")
        result_callback = None
        first_arg = args[0] if args else None
        if first_arg and hasattr(first_arg, 'result_callback'):
            result_callback = first_arg.result_callback

        result_str = ""
        if all(self.data.values()):
            user_id = db.save_user_data(
                name=self.data['name'],
                phone=self.data['phone'],
                job_title=self.data['jobTitle'],
                session_data={"session_id": self.session_id}
            )
            db.complete_form_session(self.session_id, user_id)
            self.is_submitted = True
            
            await self.websocket.send_json({
                "type": "form_update", 
                "action": "form_submitted"
            })
            
            logger.info("Form submitted successfully")
            result_str = "Form submitted successfully! Thank the user and end the conversation."
        else:
            missing = [k for k, v in self.data.items() if not v]
            result_str = f"Cannot submit yet. Missing fields: {', '.join(missing)}."

        if result_callback:
            await result_callback(result_str)
        return result_str