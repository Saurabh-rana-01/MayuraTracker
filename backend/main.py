import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
client = None
if api_key and api_key != "your_api_key_here":
    client = genai.Client(api_key=api_key)
else:
    print("WARNING: GEMINI_API_KEY not found or is still the placeholder in .env file")

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoutineGoal(BaseModel):
    goal: str
    duration: str
    current_level: Optional[str] = "beginner"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    messages: List[ChatMessage]
    current_state: Optional[dict] = None

class Task(BaseModel):
    title: str
    time: Optional[str] = None

class GeneratedRoutine(BaseModel):
    name: str
    icon: str
    color: str
    time: Optional[str] = None
    tasks: List[Task]

SYSTEM_PROMPT = """
You are an expert Productivity Coach and Routine Strategist.
Output Format:
You must respond with ONLY a valid JSON object following this structure:
{
  "name": "Routine Title (max 20 chars)",
  "icon": "One of: BookOpen, Dumbbell, Briefcase, Star, PlusCircle",
  "color": "One of: #10b981, #3b82f6, #8b5cf6, #f59e0b, #ef4444",
  "time": "HH:MM",
  "tasks": [
    { "title": "Task 1", "time": "HH:MM" }
  ]
}
"""

@app.post("/generate-routine", response_model=GeneratedRoutine)
async def generate_routine(payload: RoutineGoal):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured or invalid.")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{SYSTEM_PROMPT}\n\nUser Goal: {payload.goal}\nDuration: {payload.duration}"
        )
        
        response_text = response.text.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
            
        return json.loads(response_text)
    except Exception as e:
        print(f"Error generating routine: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(payload: ChatPayload):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured.")

    try:
        context = f"Current User Routines: {json.dumps(payload.current_state.get('routines', []))}" if payload.current_state else ""
        chat_prompt = f"You are Mayura AI Advisor. Be helpful and motivational.\n\n{context}\n\n"
        
        # Build simple prompt from history
        full_prompt = chat_prompt + "\n".join([f"{m.role}: {m.content}" for m in payload.messages])
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt
        )

        
        return {"role": "assistant", "content": response.text}
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "api_configured": client is not None}

@app.get("/health")
async def health():
    return {"status": "ok", "api_configured": api_key is not None}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
