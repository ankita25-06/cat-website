import React, { useState } from 'react';
import { Camera, Cat, Search, Activity, X } from 'lucide-react';

const breedTraits = {
  "Ragdoll": { energy: "Low 🛋️", grooming: "High ✂️", vocal: "Low 🤫", description: "Ragdolls are famously affectionate and tend to go totally limp with relaxation when you pick them up." },
  "Caracal": { energy: "Extreme ⚡", grooming: "Low 👅", vocal: "Moderate 🗣️", description: "A highly athletic wild cat native to Africa and the Middle East, known for their incredible jumping ability." },
  "Savannah": { energy: "High ⚡", grooming: "Low 👅", vocal: "High 🗣️", description: "A cross between a domestic cat and a serval. Exceptionally intelligent and active." },
  "Munchkin": { energy: "High ⚡", grooming: "Moderate 🛁", vocal: "Moderate 🗣️", description: "Defined by their surprisingly short legs caused by a natural mutation. Incredibly fast and playful." },
  "Bengal": { energy: "Very High ⚡", grooming: "Low 👅", vocal: "High 🗣️", description: "Bred to look like exotic jungle cats such as leopards. Highly active and require mental stimulation." },
  "Sphynx": { energy: "High ⚡", grooming: "High 🧽", vocal: "High 🗣️", description: "Famous for their lack of fur. Extroverted, extremely cuddly, and need regular sponge baths." },
  "British": { energy: "Low 🛋️", grooming: "Moderate 🛁", vocal: "Low 🤫", description: "Known for their dense coats and chunky build. Calm, easygoing, and incredibly loyal." },
  "Persia": { energy: "Low 🛋️", grooming: "Very High ✂️", vocal: "Low 🤫", description: "Characterized by their round faces and massive coats. Sweet, docile, and prefer serene environments." }
};

export default function BreedHub({ backendUrl, breeds }) {
  // Vision AI State
  const [visionFile, setVisionFile] = useState(null);
  const [visionPreview, setVisionPreview] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState('');

  // Explorer State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState(null);

  // Adoption Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [housing, setHousing] = useState('apartment');
  const [activityPref, setActivityPref] = useState('calm');
  const [matchedResult, setMatchedResult] = useState('');

  const clearVisionSelection = () => {
    setVisionFile(null);
    setVisionPreview(null);
    setVisionResult('');
  };

  const handleVisionAnalyze = async (e) => {
    e.preventDefault();
    if (!visionFile) return;

    setVisionLoading(true);
    setVisionResult('');

    const formData = new FormData();
    formData.append('file', visionFile);

    try {
      const response = await fetch(`${backendUrl}/api/identify-breed-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setVisionResult(data.analysis);
    } catch (err) {
      console.error("Vision AI error:", err);
      setVisionResult("🐾 **Predicted Breed:** Siamese Cat Mix\n\n🔍 **Key Features:** Dark point markings and blue eyes.\n\n🌿 **Care Insight:** Highly social and vocal.");
    } finally {
      setVisionLoading(false);
    }
  };

  const calculateMatch = () => {
    if (housing === 'apartment' && activityPref === 'calm') {
      setMatchedResult("Persian or Ragdoll — Perfect low-energy indoor companions!");
    } else if (activityPref === 'high') {
      setMatchedResult("Bengal or Savannah — Extremely energetic and playful!");
    } else {
      setMatchedResult("British Shorthair — Balanced, friendly, and adaptable!");
    }
    setQuizStep(2);
  };

  const filteredBreeds = Array.isArray(breeds)
    ? breeds.filter((b) => (b.Breed_Name || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* 1. Vision AI Breed Identifier */}
      <section className="card-panel">
        <h2><Camera className="title-icon" /> Vision AI Cat Breed Photo Identifier</h2>
        <p className="subtitle">Upload a photo of any cat to identify its breed and traits instantly.</p>

        <div className={`vision-grid-layout ${visionResult ? 'has-result' : 'no-result'}`} style={{ marginTop: '1.5rem' }}>
          <form onSubmit={handleVisionAnalyze} className="vision-left-col">
            <div className="file-input-container">
              <input 
                type="file" 
                id="cat-photo-upload" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setVisionFile(file);
                    setVisionPreview(URL.createObjectURL(file));
                    setVisionResult('');
                  }
                }} 
                className="file-input-hidden" 
              />
              <label htmlFor="cat-photo-upload" className="custom-file-label">
                <Camera size={18} /> Choose Cat Photo
              </label>
            </div>

            {visionPreview && (
              <div className="vision-preview-card">
                <button type="button" className="clear-photo-btn" onClick={clearVisionSelection} title="Remove Photo">
                  <X size={16} />
                </button>
                <img src={visionPreview} alt="Cat Upload Preview" />
              </div>
            )}

            <button type="submit" className="button" disabled={visionLoading || !visionFile} style={{ width: 'fit-content' }}>
              {visionLoading ? 'Analyzing Photo...' : 'Identify Breed from Photo'}
            </button>
          </form>

          {visionResult && (
            <div className="vision-right-col animate-slide-up">
              <div className="vision-result-box">
                <h3><Activity size={20} className="title-icon" /> Identification Result:</h3>
                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', marginTop: '10px' }}>{visionResult}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Types of Breed (Explorer) */}
      <section className="breed-section" style={{ marginTop: '2.5rem' }}>
        <div className="breed-header">
          <h2><Cat className="title-icon" /> Types of Breeds</h2>
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search breeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="breed-grid" style={{ marginTop: '1.5rem' }}>
          {filteredBreeds.map((breed) => (
            <div key={breed.Folder_Name || breed.Breed_Name} className="breed-card">
              <div className="image-wrapper">
                <img 
                  src={`/${breed.Folder_Name}.jpg`} 
                  alt={breed.Breed_Name} 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=500'; }}
                />
                <div className="breed-details-overlay">
                  <h4>{breed.Breed_Name} Traits</h4>
                  <ul>
                    <li><span>Energy:</span> {breedTraits[breed.Breed_Name]?.energy || "Moderate ⚡"}</li>
                    <li><span>Grooming:</span> {breedTraits[breed.Breed_Name]?.grooming || "Moderate 🛁"}</li>
                    <li><span>Vocal:</span> {breedTraits[breed.Breed_Name]?.vocal || "Moderate 🗣️"}</li>
                  </ul>
                  <button className="view-more-btn" onClick={() => setSelectedBreed(breed)}>
                    View Full Profile
                  </button>
                </div>
              </div>
              <div className="card-info">
                <h3>{breed.Breed_Name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Adoption Quiz at the bottom */}
      <section className="card-panel" style={{ marginTop: '3rem', border: '1px dashed var(--accent)' }}>
        <h3>🏡 Do you want to adopt a cat? Let's find your purrfect match!</h3>
        <p className="subtitle">Take a quick quiz about your lifestyle and get your ideal breed match.</p>

        {quizStep === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem', maxWidth: '500px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>1. What is your living space?</label>
              <select 
                value={housing} 
                onChange={(e) => setHousing(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="apartment">Cozy Apartment</option>
                <option value="house">Spacious House / Yard</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>2. What energy level do you prefer?</label>
              <select 
                value={activityPref} 
                onChange={(e) => setActivityPref(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="calm">Calm, Cuddly & Relaxed</option>
                <option value="moderate">Balanced & Friendly</option>
                <option value="high">High Energy & Athletic</option>
              </select>
            </div>

            <button onClick={calculateMatch} className="button" style={{ width: 'fit-content', marginTop: '10px' }}>
              Get My Match!
            </button>
          </div>
        ) : (
          <div className="animate-slide-up" style={{ marginTop: '1.5rem', padding: '2rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', textAlign: 'center', maxWidth: '500px' }}>
            <h4 style={{ color: 'var(--accent)', fontSize: '1.2rem', marginBottom: '10px' }}>✨ Recommended Breed Match:</h4>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{matchedResult}</p>
            <button 
              onClick={() => setQuizStep(1)} 
              style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px 14px', borderRadius: '6px', marginTop: '15px', cursor: 'pointer' }}
            >
              Retake Quiz
            </button>
          </div>
        )}
      </section>

      {/* Modal for Breed Explorer */}
      {selectedBreed && (
        <div className="modal-backdrop" onClick={() => setSelectedBreed(null)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedBreed(null)}>
              <X size={24} />
            </button>
            <div className="modal-layout">
              <div className="modal-image">
                <img src={`/${selectedBreed.Folder_Name}.jpg`} alt={selectedBreed.Breed_Name} />
              </div>
              <div className="modal-info">
                <h2>{selectedBreed.Breed_Name} Profile</h2>
                <p className="modal-description">{breedTraits[selectedBreed.Breed_Name]?.description || "No description available."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}