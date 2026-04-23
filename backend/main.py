from app.core.env import load_environment

load_environment()

import uvicorn

from app.core.config import get_settings
from app.main import app


# make sure there no errors with CORS
# clear the local API

if __name__ == "__main__":
    settings = get_settings()
    if settings.api_reload:
        uvicorn.run(
            "main:app",
            host=settings.api_host,
            port=settings.api_port,
            reload=True,
        )
    else:
        uvicorn.run(app, host=settings.api_host, port=settings.api_port)
