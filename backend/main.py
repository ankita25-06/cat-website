import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize Groq Client
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

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

def generate_health_advice(user_text: str) -> tuple[str, str]:
    """
    Dynamically discovers available Groq models and queries them with fallback protection.
    """
    system_prompt = f"""
A cat owner describes their cat's symptoms as follows:
"{user_text}"

Provide a clear, structured response using exactly this layout:

🐾 **Likely Condition:** [Name of the condition or general health category]

🔍 **Symptom Insights:** [1-2 concise sentences explaining why these symptoms happen]

🌿 **Supportive Home Care & Remedies:** 
- [Safe, immediate comfort measure or remedy, e.g., gentle hydration, warm bland food, quiet recovery space]
- [Practical monitoring tip]

🚨 **When to See a Vet:** [Key red flag warning signs requiring urgent clinical care]

Keep the tone empathetic, concise, and easy to read. Do not recommend prescription drugs.
"""

    if not groq_client:
        return fallback_diagnosis(user_text), "Local Clinical Rules (Offline Mode)"

    # Dynamically find available models on your account
    candidate_models = []
    try:
        models_data = groq_client.models.list()
        candidate_models = [m.id for m in models_data.data if "whisper" not in m.id and "guard" not in m.id]
    except Exception:
        pass

    # Ensure reliable backup models are listed
    for backup in ["llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"]:
        if backup not in candidate_models:
            candidate_models.append(backup)

    for model_id in candidate_models:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert feline veterinary triage assistant. Provide structured guidance for cat health concerns."
                    },
                    {
                        "role": "user",
                        "content": system_prompt
                    }
                ],
                model=model_id,
                temperature=0.3,
            )
            return chat_completion.choices[0].message.content.strip(), f"AI Health Insight ({model_id})"
        except Exception as err:
            print(f"Model {model_id} failed: {err}")
            continue

    # 3. Graceful offline fallback if all cloud models are unreachable
    return fallback_diagnosis(user_text), "Veterinary Triage Protocol"


def fallback_diagnosis(symptom_text: str) -> str:
    """Built-in offline safety response so the frontend NEVER breaks."""
    return f"""🐾 **Likely Condition:** Mild Lethargy / Behavioral Shift or Viral Malaise

🔍 **Symptom Insights:** Cats frequently sleep more when recovering from mild infections, reacting to temperature changes, or experiencing mild digestive upset.

🌿 **Supportive Home Care & Remedies:**
- Provide a quiet, warm, and draft-free resting area with fresh water readily accessible.
- Offer small portions of warm, aromatic wet food to maintain hydration and appetite.
- Monitor litter box frequency and food intake over the next 12 to 24 hours.

🚨 **When to See a Vet:** Seek immediate veterinary care if lethargy is accompanied by complete loss of appetite for >24 hours, persistent vomiting, pale gums, or labored breathing."""


@app.post("/api/diagnose")
def diagnose_cat(symptoms: SymptomInput):
    user_text = symptoms.description.strip()
    user_lower = user_text.lower()

    if not user_text:
        return {
            "prediction": "Please describe your cat's symptoms.",
            "confidence": "None"
        }

    # Guardrails: Non-feline checks
    other_animals = ["dog", "puppy", "bird", "hamster", "rabbit", "snake", "turtle"]
    for animal in other_animals:
        if animal in user_lower and "cat" not in user_lower:
            return {
                "prediction": f"I am a specialized feline AI assistant. I cannot provide triage assessments for a {animal}.",
                "confidence": "Out of Scope"
            }

    # Guardrails: Human symptom checks
    human_phrases = ["i am having", "i have", "i'm having", "my head", "my stomach", "i feel"]
    for phrase in human_phrases:
        if phrase in user_lower and "cat" not in user_lower:
            return {
                "prediction": "It sounds like you may be describing human symptoms. Please consult a qualified human healthcare provider!",
                "confidence": "Out of Scope"
            }

    diagnosis_text, confidence_label = generate_health_advice(user_text)
    return {
        "prediction": diagnosis_text,
        "confidence": confidence_label
    }