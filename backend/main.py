import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from google import genai

app = FastAPI()

# 1. Fetch the API key using the environment variable NAME:
gemini_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=gemini_key)

try:
    print("--- AVAILABLE GEMINI MODELS ---")
    for m in client.models.list():
        print(m.name)
    print("-------------------------------")
except Exception as e:
    print(f"Could not list models: {e}")

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

    # --- 2. Intelligent Feline Diagnostic via Gemini ---
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
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=system_prompt,
        )
        return {
            "prediction": response.text.strip(),
            "confidence": "AI Health Insight (Google Gemini)"
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "prediction": f"API Error: {str(e)}",
            "confidence": "System Error"
        }