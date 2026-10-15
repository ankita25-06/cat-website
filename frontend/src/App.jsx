import React, { useState, useEffect } from 'react';
import { Cat, ChevronRight } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import HealthHub from './HealthHub';
import BreedHub from './BreedHub';
import './App.css';

const BACKEND_URL = "https://cat-website-backend.onrender.com";

export default function App() {
  const [currentView, setCurrentView] = useState('intro');
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/breeds`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBreeds(data);
      })
      .catch((err) => console.error("Error fetching breeds:", err));
  }, []);

  // --- INTRO PAGE ---
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
  <button className="action-explore-btn" onClick={() => setCurrentView('health')}>
    Explore Health Hub <ChevronRight size={18} />
  </button>
  <button className="action-explore-btn" onClick={() => setCurrentView('breed')}>
    Explore Breed Hub <ChevronRight size={18} />
  </button>
</div>
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

  // --- MAIN APP (HEALTH & BREED PAGES) ---
  return (
    <div className="app-container animate-fade-in">
      <header className="navbar">
        <div className="logo" onClick={() => setCurrentView('intro')} style={{ cursor: 'pointer' }}>
          <Cat size={28} className="icon-accent" />
          <span>Feline<span className="text-white">Hub</span></span>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`nav-back-btn ${currentView === 'health' ? 'active-tab' : ''}`} 
            onClick={() => setCurrentView('health')}
            style={{ background: currentView === 'health' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: currentView === 'health' ? '#000' : '#fff' }}
          >
            🩺 Health Hub
          </button>
          <button 
            className={`nav-back-btn ${currentView === 'breed' ? 'active-tab' : ''}`} 
            onClick={() => setCurrentView('breed')}
            style={{ background: currentView === 'breed' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: currentView === 'breed' ? '#000' : '#fff' }}
          >
            🐱 Breed Hub
          </button>
        </div>
      </header>

      <main className="main-content" style={{ marginTop: '2rem' }}>
        {currentView === 'health' && <HealthHub backendUrl={BACKEND_URL} />}
        {currentView === 'breed' && <BreedHub backendUrl={BACKEND_URL} breeds={breeds} />}
      </main>
    </div>
  );
}