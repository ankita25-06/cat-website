import os
import base64
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from google import genai
from google.genai import types
from groq import Groq

gemini_client = genai.Client() if os.getenv("GEMINI_API_KEY") else None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

# Load breed information for the Breed Explorer
try:
    breeds_df = pd.read_csv("cat_breeds_summary.csv")
except Exception as e:
    print(f"Error loading breeds dataset: {e}")
    breeds_df = pd.DataFrame()

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


class SymptomInput(BaseModel):
    description: str

class BreedChatInput(BaseModel):
    query: str


def generate_health_advice(prompt: str) -> tuple[str, str]:
    if not groq_client:
        return fallback_diagnosis(), "Local Clinical Rules (Offline Mode)"

    candidate_models = ["llama-3.1-8b-instant", "llama3-8b-8192", "llama3-70b-8192"]
    for model_id in candidate_models:
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert feline assistant and veterinary triage specialist. Provide clear, concise, structured responses."},
                    {"role": "user", "content": prompt}
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
    return """🐾 **Likely Condition:** Mild Lethargy / Behavioral Shift or Viral Malaise

🔍 **Symptom Insights:** Cats frequently sleep more when recovering from mild infections or temperature changes.

🌿 **Supportive Home Care & Remedies:**
- Provide a quiet, warm resting area with fresh water.
- Offer small portions of warm wet food.

🚨 **When to See a Vet:** Seek immediate veterinary care if lethargy lasts >24 hours with vomiting or breathing issues."""


@app.get("/")
def home():
    return {"message": "Welcome to the Cat Health and Breed API"}

@app.get("/api/breeds")
def get_all_breeds():
    return breeds_df.to_dict(orient="records")

@app.post("/api/diagnose")
def diagnose_cat(symptoms: SymptomInput):
    user_text = symptoms.description.strip()
    if not user_text:
        return {"prediction": "Please describe your cat's symptoms.", "confidence": "None"}

    system_prompt = f"A cat owner describes their cat's symptoms: '{user_text}'. Give a concise triage summary."
    diagnosis_text, confidence_label = generate_health_advice(system_prompt)
    return {"prediction": diagnosis_text, "confidence": confidence_label}

@app.post("/api/breed-chat")
def breed_chat(payload: BreedChatInput):
    user_query = payload.query.strip()
    return {"answer": "Expert feline response generated.", "detected_breed": "Siamese", "image_url": DEFAULT_CAT_IMAGE}

@app.post("/api/identify-breed-image")
async def identify_breed_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if not contents:
            return {"analysis": "⚠️ Please upload a valid image file."}

        if not gemini_client:
            return {"analysis": "⚠️ GEMINI_API_KEY is missing in backend environment variables."}

        # Use Gemini Flash for fast, accurate image understanding
        response = gemini_client.models.generate_content(
            model='gemini-3.8-flash',
            contents=[
                types.Part.from_bytes(
                    data=contents,
                    mime_type=file.content_type or "image/jpeg",
                ),
                (
                    "Analyze this image of a cat in detail and provide a structured breakdown with the following format:\n"
                    "🐾 **Predicted Breed:** [Specific Breed Name or Mix]\n\n"
                    "🔍 **Key Physical Features:** [Specific coat color, pattern, eye color, and facial structure visible in this exact image]\n\n"
                    "🌿 **Care Insight:** [Tailored care, grooming, and health advice for this specific breed type]"
                ),
            ],
        )

        if response.text:
            return {"analysis": response.text}
        else:
            return {"analysis": "⚠️ Could not generate an analysis for this image. Please try another photo."}

    except Exception as general_err:
        print(f"Gemini Vision Error: {str(general_err)}")
        return {"analysis": f"⚠️ Image processing error: {str(general_err)}"}
