from pipecat.adapters.schemas.function_schema import FunctionSchema
from pipecat.adapters.schemas.tools_schema import ToolsSchema
from pipecat.processors.aggregators.llm_context import LLMContext

SYSTEM_INSTRUCTION = (
    "You are a helpful assistant collecting data for a form submission. You must collect the user's Name, Phone, and Job Title. "
    "When the user provides a piece of info, use the 'update_field' tool to save it. "
    "If some fields are still missing, explicitly ask the user for the remaining missing fields. "
    "Once you have successfully collected ALL three fields (Name, Phone, and Job Title), DO NOT submit the form immediately. "
    "Instead, repeat the collected details back to the user on three separate lines with bullet points exactly like this:\n"
    "- Name: [collected name]\n"
    "- Phone: [collected phone]\n"
    "- Job Title: [collected job title]\n"
    "And then on a new line ask: 'Is everything correct, or do you need to edit or verify?' "
    "Only call the 'submit_form' tool if the user explicitly confirms that the details are correct"
    "If they want to edit any field, call 'update_field' with the new value. "
    "Be brief, natural, and conversational."
)

def create_voice_context() -> LLMContext:
    update_field_fn = FunctionSchema(
        name="update_field",
        description="Updates a specific field in the user's information form (name, phone, or jobTitle).",
        properties={
            "field": {
                "type": "string", 
                "enum": ["name", "phone", "jobTitle"],
                "description": "The field to update."
            },
            "value": {
                "type": "string",
                "description": "The value to set for the field."
            }
        },
        required=["field", "value"]
    )

    submit_form_fn = FunctionSchema(
        name="submit_form",
        description="Submits the completed form after all fields (name, phone, and jobTitle) are collected.",
        properties={},
        required=[]
    )

    tools = ToolsSchema(standard_tools=[update_field_fn, submit_form_fn])
    
    return LLMContext(
        messages=[{"role": "system", "content": SYSTEM_INSTRUCTION}],
        tools=tools
    )