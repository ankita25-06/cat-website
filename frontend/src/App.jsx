import React, { useState, useEffect } from 'react';
import { ShieldAlert, Cat, Search, Activity, ChevronRight, X } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import './App.css';

const breedTraits = {
  "Ragdoll": { energy: "Low 🛋️", grooming: "High ✂️", vocal: "Low 🤫", description: "Ragdolls are famously affectionate and tend to go totally limp with relaxation when you pick them up. They are gentle, quiet companions." },
  "Caracal": { energy: "Extreme ⚡", grooming: "Low 👅", vocal: "Moderate 🗣️", description: "A highly athletic wild cat native to Africa and the Middle East, known for their incredible jumping ability and iconic black-tufted ears." },
  "Savannah": { energy: "High ⚡", grooming: "Low 👅", vocal: "High 🗣️", description: "A cross between a domestic cat and a serval. They are exceptionally intelligent, active, and often behave more like dogs than typical cats." },
  "Munchkin": { energy: "High ⚡", grooming: "Moderate 🛁", vocal: "Moderate 🗣️", description: "Defined by their surprisingly short legs caused by a natural mutation. Despite their stature, they are incredibly fast and playful." },
  "Bengal": { energy: "Very High ⚡", grooming: "Low 👅", vocal: "High 🗣️", description: "Bred to look like exotic jungle cats such as leopards. They are highly active, vocal, and require a lot of mental and physical stimulation." },
  "Sphynx": { energy: "High ⚡", grooming: "High 🧽", vocal: "High 🗣️", description: "Famous for their lack of fur, though they actually have a fine down. They are extroverted, extremely cuddly, and need regular sponge baths." },
  "British": { energy: "Low 🛋️", grooming: "Moderate 🛁", vocal: "Low 🤫", description: "Known for their dense coats and chunky build. They are calm, easygoing, and incredibly loyal, though not overly demanding of attention." },
  "Persia": { energy: "Low 🛋️", grooming: "Very High ✂️", vocal: "Low 🤫", description: "Characterized by their round faces and massive coats. They are sweet, docile, and prefer a serene environment to a highly active one." }
};

export default function App() {
  const [currentView, setCurrentView] = useState('intro');

  // Dashboard Data State
  const [breeds, setBreeds] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState(null);

  // Fetch data on load with fallback check
  useEffect(() => {
    fetch('https://cat-website-backend.onrender.com/api/breeds')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBreeds(data);
        } else {
          setBreeds([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching breeds:", err);
        setBreeds([]);
      });
  }, []);

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setLoadingDiagnosis(true);
    try {
      const response = await fetch('https://cat-website-backend.onrender.com/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: symptomInput }),
      });
      const data = await response.json();
      setDiagnosisResult(data);
    } catch (error) {
      console.error("Diagnosis error:", error);
      setDiagnosisResult({
        prediction: "Could not connect to the backend service. It might be waking up—please try again in 30 seconds.",
        confidence: "Connection Error"
      });
    } finally {
      setLoadingDiagnosis(false);
    }
  };

  // Safe filtering prevents crashes if Breed_Name is missing or undefined
  const filteredBreeds = Array.isArray(breeds)
    ? breeds.filter((b) =>
        (b.Breed_Name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // --- Slideshow Logic ---
  const slideshowImages = [
    "/cat-slide (1).jpeg",
    "/cat-slide (2).jpeg",
    "/cat-slide (3).jpeg",
    "/cat-slide (4).jpeg",
    "/cat-slide (5).jpeg",
    "/cat-slide (6).jpeg",
    "/cat-slide (7).jpeg",
    "/cat-slide (8).jpeg",
    "/cat-slide (9).jpeg",
    "/cat-slide (10).jpeg",
    "/cat-slide (11).jpeg",
    "/cat-slide (12).jpeg",
    "/cat-slide (13).jpeg"
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slideshowImages.length);
    }, 2000);
    
    return () => clearInterval(slideInterval);
  }, [slideshowImages.length]);

  // --- PAGE ONE: THE CINEMATIC INTRODUCTION ---
  if (currentView === 'intro') {
    return (
      <div className="intro-page-container animate-fade-in">
        <div className="fullscreen-video-bg">
          <video autoPlay loop muted playsInline>
            <source src="/floating-cat.mp4" type="video/mp4" />
          </video>
          <div className="fullscreen-video-overlay"></div>
        </div>

        <header className="minimal-header">
          <div className="brand-logo">
            <Cat size={24} className="icon-accent" />
            <span>Feline<span className="text-white">Hub</span></span>
          </div>
        </header>

        <div className="cinematic-hero">
          <div className="hero-text-block">
            <h1 className="hero-giant-heading">
              Feed me with <br />
              <span className="gradient-word">LOVE</span>
            </h1>
            
            <TypeAnimation
              sequence={[
                'An intersection of artificial intelligence and animal care. Predict symptoms, track lineages, and understand your companion deeper.',
                2000,
              ]}
              wrapper="p"
              speed={10}
              className="hero-narrative"
              cursor={true}
              repeat={0} 
            />

            <button className="action-explore-btn" onClick={() => setCurrentView('dashboard')}>
              Enter Experience <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="hero-space-filler"></div>
        </div>

        <footer className="minimal-footer">
          <span>Project Data Engine // Kaggle Verified Dataset Pipeline</span>
          <span>[ 2026 Edition ]</span>
        </footer>
      </div>
    );
  }

  // --- PAGE TWO: THE APPLICATION DATA DASHBOARD ---
  return (
    <div className="app-container animate-fade-in">
      <header className="navbar">
        <div className="logo" onClick={() => setCurrentView('intro')} style={{ cursor: 'pointer' }}>
          <Cat size={28} className="icon-accent" />
          <span>Feline<span className="text-white">Hub</span></span>
        </div>
        <button className="nav-back-btn" onClick={() => setCurrentView('intro')}>
          Return to Intro
        </button>
      </header>

      <main className="main-content">
        {/* Symptom Checker Card */}
        <section className="card-panel symptom-section">
          <div className="symptom-layout-grid">
            
            {/* Left Column: The Form */}
            <div className="symptom-form-area">
              <h2><ShieldAlert className="title-icon" /> AI Cat Health Assistant</h2>
              <p className="subtitle">Describe your cat's behavior or health changes in plain sentences (e.g., "My cat is vomiting and seems very lazy").</p>
              
              <form onSubmit={handleDiagnose} className="symptom-form">
                <textarea
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Type symptoms here..."
                  rows={5}
                />
                <button type="submit" className="button" disabled={loadingDiagnosis}>
                  {loadingDiagnosis ? 'Analyzing Data...' : 'Analyze Health'}
                </button>
              </form>

              {diagnosisResult && (
                <div className="result-display animate-slide-up">
                  <h3><Activity size={20} /> Analysis Result:</h3>
                  <p className="prediction-text" style={{ whiteSpace: "pre-line" }}>
                    {diagnosisResult.prediction}
                  </p>
                  <span className="confidence-tag">{diagnosisResult.confidence}</span>
                  <p className="disclaimer">*Always consult a certified veterinarian for official medical evaluations.</p>
                </div>
              )}
            </div>

            <div className="symptom-image-area">
              {slideshowImages.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Cat aesthetic ${index + 1}`}
                  className={`slide-image ${index === currentSlide ? 'active' : ''}`}
                />
              ))}
              <div className="image-overlay-glow"></div>
            </div>

          </div>
        </section>

        <section className="breed-section">
          <div className="breed-header">
            <h2><Cat className="title-icon" /> Breed Explorer</h2>
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

          <div className="breed-grid">
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

        {/* --- POPUP MODAL --- */}
        {selectedBreed && (
          <div className="modal-backdrop" onClick={() => setSelectedBreed(null)}>
            <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setSelectedBreed(null)}>
                <X size={24} />
              </button>

              <div className="modal-layout">
                <div className="modal-image">
                  <img 
                    src={`/${selectedBreed.Folder_Name}.jpg`} 
                    alt={selectedBreed.Breed_Name} 
                  />
                </div>

                <div className="modal-info">
                  <h2>{selectedBreed.Breed_Name} Profile</h2>
                  <p className="modal-description">
                    {breedTraits[selectedBreed.Breed_Name]?.description || "No detailed description available for this breed."}
                  </p>

                  <div className="modal-stats">
                    <div className="stat-box">
                      <span className="stat-label">Energy</span>
                      <span className="stat-value">{breedTraits[selectedBreed.Breed_Name]?.energy}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Grooming</span>
                      <span className="stat-value">{breedTraits[selectedBreed.Breed_Name]?.grooming}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Vocal</span>
                      <span className="stat-value">{breedTraits[selectedBreed.Breed_Name]?.vocal}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}