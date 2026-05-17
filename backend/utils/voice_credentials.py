import os
import json
import logging
from core.config import settings

logger = logging.getLogger(__name__)

def load_voice_credentials() -> str:
    credentials_path = "service_account.json"
    env_creds = settings.GOOGLE_SERVICE_ACCOUNT_JSON
    if env_creds:
        try:
            creds_dict = json.loads(env_creds)
            if "private_key" in creds_dict and isinstance(creds_dict["private_key"], str):
                creds_dict["private_key"] = creds_dict["private_key"].replace("\\n", "\n")
            
            temp_path = "GOOGLE_SERVICE_ACCOUNT_JSON"
            with open(temp_path, "w") as f:
                json.dump(creds_dict, f)
            logger.info("Loaded Vertex AI credentials from GOOGLE_SERVICE_ACCOUNT_JSON env variable")
            return temp_path
        except Exception as e:
            logger.error(f"Failed to load service account credentials from env variable: {e}")
            
    if os.path.exists("GOOGLE_SERVICE_ACCOUNT_JSON"):
        return "GOOGLE_SERVICE_ACCOUNT_JSON"
        
    return credentials_path