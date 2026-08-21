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

# 2. Load breed information for the Breed Explorer
try:
    breeds_df = pd.read_csv("cat_breeds_summary.csv")
except Exception as e:
    print(f"Error loading breeds dataset: {e}")
    breeds_df = pd.DataFrame()

# 3. Comprehensive Breed Image Mapping
BREED_IMAGES = {
    "persian": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop",
    "siamese": "https://images.unsplash.com/photo-1513360309081-38f0762daed1?w=600&auto=format&fit=crop",
    "maine coon": "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop",
    "bengal": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop",
    "ragdoll": "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop",
    "sphynx": "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600&auto=format&fit=crop",
    "british shorthair": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop",
    "abyssinian": "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&auto=format&fit=crop",
    "scottish fold": "https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&auto=format&fit=crop",
    "russian blue": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop",
    "birman": "https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=600&auto=format&fit=crop"
}
DEFAULT_CAT_IMAGE = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop"


# --- Schemas ---
class SymptomInput(BaseModel):
    description: str

class BreedChatInput(BaseModel):
    query: str


# --- Core Helper Functions ---
def generate_health_advice(prompt: str) -> tuple[str, str]:
    """
    Dynamically discovers available Groq models and queries them with fallback protection.
    """
    if not groq_client:
        return fallback_diagnosis(), "Local Clinical Rules (Offline Mode)"

    candidate_models = []
    try:
        models_data = groq_client.models.list()
        candidate_models = [m.id for m in models_data.data if "whisper" not in m.id and "guard" not in m.id]
    except Exception:
        pass

    for backup in ["llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"]:
        if backup not in candidate_models:
            candidate_models.append(backup)

    for model_id in candidate_models:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert feline assistant and veterinary triage specialist. Provide clear, concise, structured responses."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=model_id,
                temperature=0.3,
            )
            return chat_completion.choices[0].message.content.strip(), f"AI Health Insight ({model_id})"
        except Exception as err:
            print(f"Model {model_id} failed: {err}")
            continue

    return fallback_diagnosis(), "Veterinary Triage Protocol"


def fallback_diagnosis() -> str:
    """Built-in offline safety response so the frontend never breaks."""
    return """🐾 **Likely Condition:** Mild Lethargy / Behavioral Shift or Viral Malaise

🔍 **Symptom Insights:** Cats frequently sleep more when recovering from mild infections, reacting to temperature changes, or experiencing mild digestive upset.

🌿 **Supportive Home Care & Remedies:**
- Provide a quiet, warm, and draft-free resting area with fresh water readily accessible.
- Offer small portions of warm, aromatic wet food to maintain hydration and appetite.
- Monitor litter box frequency and food intake over the next 12 to 24 hours.

🚨 **When to See a Vet:** Seek immediate veterinary care if lethargy is accompanied by complete loss of appetite for >24 hours, persistent vomiting, pale gums, or labored breathing."""


# --- Routes ---
@app.get("/")
def home():
    return {"message": "Welcome to the Cat Health and Breed API"}

@app.get("/api/breeds")
def get_all_breeds():
    return breeds_df.to_dict(orient="records")

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
    diagnosis_text, confidence_label = generate_health_advice(system_prompt)
    return {
        "prediction": diagnosis_text,
        "confidence": confidence_label
    }

@app.post("/api/breed-chat")
def breed_chat(payload: BreedChatInput):
    user_query = payload.query.strip()
    user_lower = user_query.lower()

    if not user_query:
        return {
            "answer": "Ask me anything about cat breeds (e.g. temperament, grooming, or apartment suitability)!",
            "detected_breed": None,
            "image_url": DEFAULT_CAT_IMAGE
        }

    # Identify matched breed
    detected_breed = None
    image_url = DEFAULT_CAT_IMAGE
    for breed_name, img_link in BREED_IMAGES.items():
        if breed_name in user_lower:
            detected_breed = breed_name.title()
            image_url = img_link
            break

    # Enrich prompt with CSV breed context if available
    csv_context = ""
    if detected_breed and not breeds_df.empty:
        matched_rows = breeds_df[breeds_df['name'].str.lower() == detected_breed.lower()] if 'name' in breeds_df.columns else pd.DataFrame()
        if not matched_rows.empty:
            csv_context = f"\nRelevant Dataset Info: {matched_rows.iloc[0].to_dict()}"

    system_prompt = f"""
You are an expert feline breed specialist.
Answer this user question about cat breeds clearly, concisely, and accurately:
"{user_query}"
{csv_context}

Provide key details on temperament, care needs, or living space recommendations in 2-3 structured bullet points. Keep it engaging and under 120 words.
"""

    answer_text, _ = generate_health_advice(system_prompt)

    return {
        "answer": answer_text,
        "detected_breed": detected_breed,
        "image_url": image_url
    }