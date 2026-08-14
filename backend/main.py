import os
import json
import urllib.request
import urllib.error
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load breed information for the Breed Explorer
try:
    breeds_df = pd.read_csv("cat_breeds_summary.csv")
except Exception as e:
    print(f"Error loading breeds dataset: {e}")
    breeds_df = pd.DataFrame()

@app.get("/")
def home():
    return {"message": "Welcome to the Cat Health and Breed API"}

@app.get("/api/breeds")
def get_all_breeds():
    return breeds_df.to_dict(orient="records")

class SymptomInput(BaseModel):
    description: str

def query_gemini_api(api_key: str, prompt: str):
    """
    Tries active model endpoints sequentially until one succeeds.
    """
    candidate_models = [
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-pro"
    ]
    
    last_error = None

    for model in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                result = json.loads(response.read().decode("utf-8"))
                text_response = result["candidates"][0]["content"]["parts"][0]["text"]
                return text_response, model
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            print(f"Model {model} failed ({e.code}): {error_body}")
            last_error = f"{model} returned {e.code}: {error_body}"
            continue
        except Exception as e:
            last_error = str(e)
            continue

    raise Exception(f"All candidate models failed. Details: {last_error}")

@app.post("/api/diagnose")
def diagnose_cat(symptoms: SymptomInput):
    user_text = symptoms.description.strip()
    user_lower = user_text.lower()

    if not user_text:
        return {
            "prediction": "Please describe your cat's symptoms.",
            "confidence": "None"
        }

    # --- 1. Quick Local Rule Checks ---
    other_animals = ["dog", "puppy", "bird", "hamster", "rabbit", "snake", "turtle"]
    for animal in other_animals:
        if animal in user_lower and "cat" not in user_lower:
            return {
                "prediction": f"I am a specialized feline AI. I cannot provide assessments for a {animal}.",
                "confidence": "Out of Scope"
            }

    human_phrases = ["i am having", "i have", "i'm having", "my head", "my stomach", "i feel"]
    for phrase in human_phrases:
        if phrase in user_lower and "cat" not in user_lower:
            return {
                "prediction": "It sounds like you may be describing human symptoms. Please consult a qualified human physician!",
                "confidence": "Out of Scope"
            }

    # Retrieve API key
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        return {
            "prediction": "Error: GEMINI_API_KEY environment variable is not configured on the server.",
            "confidence": "Config Error"
        }

    # --- 2. Build Structured Prompt ---
    system_prompt = f"""
You are an expert feline veterinary triage assistant.
A cat owner describes their cat's symptoms as follows:
"{user_text}"

Provide a clear, structured response using exactly this layout:

🐾 **Likely Condition:** [Name of the condition or health category]

🔍 **Symptom Insights:** [1-2 concise sentences explaining why these symptoms happen]

🌿 **Supportive Home Care & Remedies:** 
- [Safe, immediate comfort measure or remedy, e.g., gentle hydration, warm bland food, quiet recovery space]
- [Practical monitoring tip]

🚨 **When to See a Vet:** [Key red flag warning signs requiring urgent clinical care]

Keep the tone empathetic, concise, and easy to read. Do not recommend prescription drugs.
"""

    try:
        diagnosis_text, working_model = query_gemini_api(gemini_key, system_prompt)
        return {
            "prediction": diagnosis_text.strip(),
            "confidence": f"AI Health Insight ({working_model})"
        }
    except Exception as e:
        print(f"Gemini Request Error: {e}")
        return {
            "prediction": f"API Error: {str(e)}",
            "confidence": "System Error"
        }