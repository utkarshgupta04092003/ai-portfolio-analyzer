from typing import Dict
import os

class FeatureFlags:
    def __init__(self):
        self.flags: Dict[str, bool] = {
            "USE_MOCK_DATA_PROVIDER": os.getenv("USE_MOCK_DATA_PROVIDER", "True").lower() in ["true", "1", "yes"],
            "ENABLE_CHAT_AGENT": os.getenv("ENABLE_CHAT_AGENT", "True").lower() in ["true", "1", "yes"],
            "ENABLE_SIMULATION": os.getenv("ENABLE_SIMULATION", "True").lower() in ["true", "1", "yes"],
        }

    def is_enabled(self, flag_name: str) -> bool:
        return self.flags.get(flag_name, False)

feature_flags = FeatureFlags()
