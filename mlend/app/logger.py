# logger.py

import os
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

try:
    import colorlog
    COLORLOG_AVAILABLE = True
except ImportError:
    COLORLOG_AVAILABLE = False

# Load env vars (optional use for log level etc.)
load_dotenv()

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # Prevent multiple handlers

    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(log_level)

    # Ensure logs/ directory exists
    log_file = "logs/mlend.log"
    os.makedirs(os.path.dirname(log_file), exist_ok=True)

    # File handler (rotating)
    file_handler = RotatingFileHandler(
        filename=log_file,
        maxBytes=2 * 1024 * 1024,  # 2MB
        backupCount=5,
        encoding="utf-8"
    )
    file_formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    file_handler.setFormatter(file_formatter)
    logger.addHandler(file_handler)

    # Console handler (with color)
    console_handler = logging.StreamHandler()
    if COLORLOG_AVAILABLE:
        color_formatter = colorlog.ColoredFormatter(
            fmt="%(log_color)s[%(levelname)s] %(name)s: %(message)s",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "white",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "bold_red"
            }
        )
        console_handler.setFormatter(color_formatter)
    else:
        console_handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s: %(message)s"))

    logger.addHandler(console_handler)
    return logger
