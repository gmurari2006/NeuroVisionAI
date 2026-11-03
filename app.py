"""
NeuroVisionAI - Backend Entry Point Redirect
The platform uses a FastAPI backend located at backend/main.py.
To start the backend server:
    python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
"""

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

