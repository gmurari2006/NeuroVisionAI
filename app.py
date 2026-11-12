"""
NeuroVisionAI - Backend Entry Point Redirect
The platform uses a FastAPI backend located at backend/main.py.
To start the backend server:
    python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
"""

import os
from backend.main import app

if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)

