import React, { useState, useEffect } from 'react';
import { ShieldAlert, Cat, Search, Activity, ChevronRight, X, MapPin, Camera, MessageSquare } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import BreedChat from './BreedChat';
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

const BACKEND_URL = "https://cat-website-backend.onrender.com";

export default function App() {
  const [currentView, setCurrentView] = useState('intro');

  // Dashboard Data State
  const [breeds, setBreeds] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState(null);

  // Vision AI State
  const [visionFile, setVisionFile] = useState(null);
  const [visionPreview, setVisionPreview] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState('');

  // Fetch data on load
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/breeds`)
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
    if (e) e.preventDefault();
    if (!symptomInput.trim()) return;

    setLoadingDiagnosis(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/diagnose`, {
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

  const handleVisionSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVisionFile(file);
      setVisionPreview(URL.createObjectURL(file));
      setVisionResult('');
    }
  };

  const clearVisionSelection = () => {
  setVisionFile(null);
  setVisionPreview(null);
  setVisionResult('');
};

  const handleVisionAnalyze = async (e) => {
    e.preventDefault();
    if (!visionFile) return;

    setVisionLoading(true);
    const formData = new FormData();
    formData.append('file', visionFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/identify-breed-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setVisionResult(data.analysis);
    } catch (err) {
      console.error("Vision AI error:", err);
      setVisionResult("Failed to identify breed. Please check backend connection.");
    } finally {
      setVisionLoading(false);
    }
  };

  const openNearbyVets = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          window.open(`https://www.google.com/maps/search/veterinary+clinic/@${latitude},${longitude},14z`, '_blank');
        },
        () => {
          window.open('https://www.google.com/maps/search/veterinary+clinic+near+me', '_blank');
        }
      );
    } else {
      window.open('https://www.google.com/maps/search/veterinary+clinic+near+me', '_blank');
    }
  };

  const filteredBreeds = Array.isArray(breeds)
    ? breeds.filter((b) =>
        (b.Breed_Name || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const slideshowImages = [
    "/cat-slide (1).jpeg", "/cat-slide (2).jpeg", "/cat-slide (3).jpeg",
    "/cat-slide (4).jpeg", "/cat-slide (5).jpeg", "/cat-slide (6).jpeg",
    "/cat-slide (7).jpeg", "/cat-slide (8).jpeg", "/cat-slide (9).jpeg",
    "/cat-slide (10).jpeg", "/cat-slide (11).jpeg", "/cat-slide (12).jpeg",
    "/cat-slide (13).jpeg"
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slideshowImages.length);
    }, 2000);
    return () => clearInterval(slideInterval);
  }, [slideshowImages.length]);

  // --- PAGE ONE: INTRO ---
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

  // --- PAGE TWO: DASHBOARD ---
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
            <div className="symptom-form-area">
              <h2><ShieldAlert className="title-icon" /> AI Cat Health Assistant</h2>
              <p className="subtitle">Describe your cat's behavior or health changes in plain sentences.</p>
              
              <form onSubmit={handleDiagnose} className="symptom-form">
                <textarea
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleDiagnose(e);
                    }
                  }}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '12px' }}>
                    <span className="confidence-tag">{diagnosisResult.confidence}</span>
                    <button onClick={openNearbyVets} className="view-more-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} /> Find Nearby Emergency Vet
                    </button>
                  </div>
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

        {/* AI Breed Vision Photo Identifier Card */}
<section className="card-panel vision-section">
  <h2><Camera className="title-icon" /> Vision AI Cat Breed Photo Identifier</h2>
  <p className="subtitle">Upload a photo of any cat to identify its breed and traits instantly.</p>

  <div className={`vision-grid-layout ${visionResult ? 'has-result' : 'no-result'}`}>
    {/* Left Column: Input + Photo + Button */}
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
          <Camera size={18} />
          Choose Cat Photo
        </label>
      </div>

      {visionPreview && (
        <div className="vision-preview-card">
          <button 
            type="button" 
            className="clear-photo-btn" 
            onClick={clearVisionSelection}
            title="Remove Photo"
          >
            <X size={16} />
          </button>
          <img src={visionPreview} alt="Cat Upload Preview" />
        </div>
      )}

      <button 
        type="submit" 
        className="button action-explore-btn" 
        style={{ width: 'fit-content', height: 'auto', padding: '10px 20px' }}
        disabled={visionLoading || !visionFile}
      >
        {visionLoading ? 'Analyzing Photo...' : 'Identify Breed from Photo'}
      </button>
    </form>

    {/* Right Column: Appears ONLY when visionResult has content */}
    {visionResult && (
      <div className="vision-right-col animate-slide-up">
        <div className="vision-result-box">
          <h3><Activity size={20} className="title-icon" /> Identification Result:</h3>
          <div className="vision-result-content">
            <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{visionResult}</p>
          </div>
        </div>
      </div>
    )}
  </div>
</section>


  


        {/* Breed Chat Bot Section */}
        <BreedChat backendUrl={BACKEND_URL} />

        {/* Breed Explorer */}
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

        {/* Modal */}
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
                      <span className="stat-value">{breedTraits[selectedBreed.Breed_Name]?.energy || "Moderate ⚡"}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Grooming</span>
                      <span className="stat-value">{breedTraits[selectedBreed.Breed_Name]?.grooming || "Moderate 🛁"}</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-label">Vocal</span>
                      <span className="stat-value">{breedTraits[selectedBreed.Breed_Name]?.vocal || "Moderate 🗣️"}</span>
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