'use client';

import { useState } from 'react';
import styles from './page.module.css';
import ResultsDisplay from '@/components/ResultsDisplay';

export default function Home() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image1 || !image2) {
      setError("Please upload both 'Current You' and 'Goal Persona' images.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze images');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Unlock Your <span className="gradient-text">Aesthetic</span>
        </h1>
        <p className={styles.subtitle}>
          Upload a photo of yourself and your goal aesthetic. Our AI will analyze your physique and style, providing a step-by-step transformation routine.
        </p>
      </div>

      <div className={styles.uploadSection}>
        <div className={styles.uploadBox}>
          <h3>Current You</h3>
          <label className={styles.dropZone}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageChange(e, setImage1, setPreview1)} 
              style={{ display: 'none' }} 
            />
            {preview1 ? (
              <img src={preview1} alt="Current" className={styles.previewImage} />
            ) : (
              <span>📸 Click to upload</span>
            )}
          </label>
        </div>

        <div className={styles.uploadBox}>
          <h3>Goal Persona</h3>
          <label className={styles.dropZone}>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageChange(e, setImage2, setPreview2)} 
              style={{ display: 'none' }} 
            />
            {preview2 ? (
              <img src={preview2} alt="Goal" className={styles.previewImage} />
            ) : (
              <span>✨ Click to upload</span>
            )}
          </label>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button 
        className={styles.analyzeBtn} 
        onClick={handleAnalyze}
        disabled={loading || !image1 || !image2}
      >
        {loading ? (
          <><span className={styles.loader}></span> Analyzing...</>
        ) : (
          'Analyze & Transform ✨'
        )}
      </button>

      {results && <ResultsDisplay results={results} />}
    </main>
  );
}
