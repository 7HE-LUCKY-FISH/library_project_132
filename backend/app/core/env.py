from functools import lru_cache

from dotenv import find_dotenv, load_dotenv


@lru_cache(maxsize=1)
def load_environment() -> str:
    """Load environment variables from the nearest .env file if one exists."""
    env_path = find_dotenv(usecwd=True)
    load_dotenv(dotenv_path=env_path or None, override=False)
    return env_path
