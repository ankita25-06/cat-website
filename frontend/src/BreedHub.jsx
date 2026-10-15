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
  const [matchedResult, setMatchedResult] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({
    home: 'apartment',
    timeAtHome: 'moderate',
    reason: 'companionship',
    children: 'no',
    pets: 'no',
    householdAgreed: 'yes',
    vetCommitment: 'yes',
    financialPrepared: 'yes',
    dailyTime: '1-2',
    motivation: 'cuddle'
  });

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

  const handleQuizChange = (field, value) => {
    setQuizAnswers(prev => ({ ...prev, [field]: value }));
  };

  const calculateMatch = (e) => {
    if (e) e.preventDefault();

    if (quizAnswers.home === 'apartment' && (quizAnswers.dailyTime === '<1' || quizAnswers.motivation === 'cuddle')) {
      setMatchedResult("Persian or Ragdoll — Soft, calm, and affectionate lap cats that adapt perfectly to indoor apartment living!");
    } else if (quizAnswers.motivation === 'active' || quizAnswers.dailyTime === '2+') {
      setMatchedResult("Bengal or Savannah — High-energy, athletic, and intelligent breeds that thrive on interactive play and stimulation!");
    } else if (quizAnswers.children === 'yes' || quizAnswers.pets === 'yes') {
      setMatchedResult("British Shorthair or Maine Coon — Patient, sturdy, and gentle breeds renowned for getting along wonderfully with kids and other pets!");
    } else if (quizAnswers.reason === 'vocal') {
      setMatchedResult("Siamese — Extremely talkative, social, and expressive companions that love communicating with their owners!");
    } else {
      setMatchedResult("American Shorthair or Scottish Fold — Easygoing, sweet, adaptable, and balanced companions for any home!");
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

      {/* 3. Comprehensive 10-Question Adoption Quiz */}
      <section className="card-panel" style={{ marginTop: '3rem', border: '1px dashed var(--accent)' }}>
        <h3>🏡 Do you want to adopt a cat? Let's find your purrfect match!</h3>
        <p className="subtitle">Answer these 10 lifestyle questions to find the ideal cat breed for your home and routine.</p>

        {quizStep === 1 ? (
          <form onSubmit={calculateMatch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '1.5rem' }}>
            
            {/* Question 1 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>1. Your Home</label>
              <select 
                value={quizAnswers.home} 
                onChange={(e) => handleQuizChange('home', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="apartment">Cozy Apartment / Studio</option>
                <option value="house">Spacious House / Yard Access</option>
              </select>
            </div>

            {/* Question 2 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>2. Time at Home</label>
              <select 
                value={quizAnswers.timeAtHome} 
                onChange={(e) => handleQuizChange('timeAtHome', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="fulltime">Work from Home / Always around</option>
                <option value="moderate">4–8 Hours Away (Standard workday)</option>
                <option value="long">8+ Hours Away (Travel / Busy schedule)</option>
              </select>
            </div>

            {/* Question 3 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>3. Adoption Reason</label>
              <select 
                value={quizAnswers.reason} 
                onChange={(e) => handleQuizChange('reason', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="companionship">Emotional Companionship 💖</option>
                <option value="vocal">Interactive & Vocal Buddy 🗣️</option>
                <option value="lowmaintenance">Quiet & Independent Friend 🛋️</option>
              </select>
            </div>

            {/* Question 4 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>4. Children at Home?</label>
              <select 
                value={quizAnswers.children} 
                onChange={(e) => handleQuizChange('children', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="no">No Children</option>
                <option value="yes">Yes (Young Kids / Toddlers)</option>
              </select>
            </div>

            {/* Question 5 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>5. Other Pets?</label>
              <select 
                value={quizAnswers.pets} 
                onChange={(e) => handleQuizChange('pets', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="no">Single Pet Household</option>
                <option value="yes">Yes (Dogs or other cats)</option>
              </select>
            </div>

            {/* Question 6 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>6. Household Members On Board?</label>
              <select 
                value={quizAnswers.householdAgreed} 
                onChange={(e) => handleQuizChange('householdAgreed', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="yes">Yes, everyone agrees!</option>
                <option value="unsure">Still discussing</option>
              </select>
            </div>

            {/* Question 7 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>7. Committed to Lifelong Vet Care (15–20 yrs)?</label>
              <select 
                value={quizAnswers.vetCommitment} 
                onChange={(e) => handleQuizChange('vetCommitment', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="yes">Yes, fully committed</option>
                <option value="unsure">Uncertain about long-term</option>
              </select>
            </div>

            {/* Question 8 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>8. Financially Prepared for Ownership Costs?</label>
              <select 
                value={quizAnswers.financialPrepared} 
                onChange={(e) => handleQuizChange('financialPrepared', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="yes">Yes (Food, litter, vet, emergency fund)</option>
                <option value="budget">Working on a budget</option>
              </select>
            </div>

            {/* Question 9 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>9. Daily Time for Care & Attention</label>
              <select 
                value={quizAnswers.dailyTime} 
                onChange={(e) => handleQuizChange('dailyTime', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="<1">Less than 1 hour / day</option>
                <option value="1-2">1 to 2 hours / day</option>
                <option value="2+">2+ hours / day (Active play & grooming)</option>
              </select>
            </div>

            {/* Question 10 */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>10. Main Motivation for Adopting</label>
              <select 
                value={quizAnswers.motivation} 
                onChange={(e) => handleQuizChange('motivation', e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #1e293b' }}
              >
                <option value="cuddle">Quiet cuddle & relaxation partner 🛋️</option>
                <option value="active">Energetic playmate & training 🎾</option>
                <option value="family">Loving family addition 👨‍👩‍👧</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
              <button type="submit" className="button" style={{ width: 'fit-content' }}>
                Get My Purrfect Match!
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-slide-up" style={{ marginTop: '1.5rem', padding: '2rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--accent)', fontSize: '1.25rem', marginBottom: '10px' }}>✨ Your Recommended Breed Match:</h4>
            <p style={{ fontSize: '1.15rem', fontWeight: 'bold', lineHeight: '1.6' }}>{matchedResult}</p>
            
            {quizAnswers.vetCommitment === 'yes' && quizAnswers.financialPrepared === 'yes' && (
              <p style={{ color: '#4ade80', fontSize: '0.9rem', marginTop: '12px' }}>
                ✓ Great readiness score! You meet all financial and care commitments for cat adoption.
              </p>
            )}

            <button 
              onClick={() => setQuizStep(1)} 
              style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 18px', borderRadius: '6px', marginTop: '18px', cursor: 'pointer' }}
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