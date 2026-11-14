from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8", extra="ignore")

    ai_service_port: int = 8000
    ai_service_internal_key: str = "dev_ai_internal_key"
    ai_mock_mode: bool = True
    ai_provider: str = "mock"
    ai_vision_provider: str = "mock"
    ai_llm_provider: str = "mock"
    ai_stt_provider: str = "mock"
    ai_tts_provider: str = "mock"
    openai_api_key: str = ""
    gemini_api_key: str = ""
    sarvam_api_key: str = ""


settings = Settings()
