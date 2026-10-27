# Alias de compatibilidad: el punto de entrada oficial según la guía del profesor está en la raíz (main.py)
from main import app, root, health_check, on_startup

__all__ = ["app", "root", "health_check", "on_startup"]
