import os
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from starlette.responses import StreamingResponse
from dotenv import load_dotenv

# load .env from root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", ".env"))

# Read an environment variable 'OLLAMA_BASE_URL' to know where your Ollama API is running. The 2nd input is the default value.
OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Allowed origins for CORS is a list of URLs that are allowed to call your backend.
# In this case the allowed URL is the frontend application running on localhost:3000 'Next.js'
ALLOWED_ORIGINS = ["http://localhost:3000"]

# Initializing FastAPI application
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS, # Allow requests from the frontend
    allow_methods=["*"], # Allow all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"], # Allow all headers
)

# Define Pydantic models for request and response validation (data structure validation)
# Pydantic validates that these fields exist and are the correct type.
class Msg(BaseModel):
    role: str # Role of the message sender (user or assistant)
    content: str # Content of the message

# Defines the request body that the /chat endpoint expects.
class ChatBody(BaseModel):
    model: str = "llama3.2:latest" # Model to use for chat (Default: llama3.2:latest)
    messages: List[Msg] # List of messages to send in the chat
    stream: bool = False # Whether to stream the response (Default: False)

# Helper function to stream Ollama responses to the frontend.
async def _ollama_stream(payload): # Defines an asynchronous function that doesn’t block other code while waiting.
    async with httpx.AsyncClient(timeout=None) as client: # Creates an asynchronous HTTP client with no timeout limit.
        async with client.stream("POST", f"{OLLAMA_BASE}/api/chat", json=payload) as r: # Opens a streaming POST request to Ollama
            r.raise_for_status() # Raises an error if the response status is not 200 OK (if Ollama returns an HTTP error).
            async for line in r.aiter_lines(): # Asynchronously iterates over each line in the response.
                if not line:
                    continue
                yield f"data: {line}\n\n".encode() # Sends each line to the frontend in Server-Sent Event (SSE) format.

# Health check endpoint
@app.get("/")
async def read_root(): 
    return {"message": "Welcome to the FastAPI backend!"} # Returns a JSON message when you visit the root in the browser.

# Chat endpoint 
@app.post("/chat")
async def chat(body: ChatBody): # Receives JSON in the format of ChatBody
    payload = { # Prepares the payload to send to the Ollama API
        "model": body.model, # Model to use for chat
        "messages": [m.model_dump() for m in body.messages], # List of messages to send in the chat
        "stream": body.stream, # Whether to stream the response
    }
    # If streaming is requested, return a streaming response
    if body.stream:
        return StreamingResponse(_ollama_stream(payload), media_type="text/event-stream") # Sends the response token-by-token to the frontend in SSE format.

    # Non-streaming response
    async with httpx.AsyncClient(timeout=None) as client: # Creates an asynchronous HTTP client with no timeout limit.
        r = await client.post(f"{OLLAMA_BASE}/api/chat", json=payload) # Sends a regular POST request to the Ollama API
        # Waits for the full response
        # If the response is an error, raise an HTTPException
        if r.is_error:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        # If successful, return the full JSON response from Ollama
        return r.json()
