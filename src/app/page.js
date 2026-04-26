'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import ResultsDisplay from '@/components/ResultsDisplay';
import appIcon from './icon.png';

export default function Home() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e, setImage, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File exceeds the 5MB limit.");
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, WEBP, HEIC, and HEIF are allowed.");
        return;
      }
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
    formData.append('image1', new Blob([image1], { type: image1.type }), 'image1.jpg');
    formData.append('image2', new Blob([image2], { type: image2.type }), 'image2.jpg');

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
        <div className={styles.titleWrapper}>
          <Image src={appIcon} alt="Logo" width={60} height={60} className={styles.headingLogo} />
          <h1 className={styles.title}>
            <span className="gradient-text">Steal the Look</span>
          </h1>
        </div>
        <marquee className={styles.subtitle} scrollamount="5">
          Upload a photo of yourself and your goal aesthetic. Our AI will analyze your physique and style, providing a step-by-step transformation routine.
        </marquee>
      </div>

      <div className={styles.uploadSection}>
        <div className={styles.uploadBox}>
          <h3>Current You</h3>
          <input 
            id="file-input-1"
            type="file" 
            accept="image/jpeg, image/png, image/webp, image/heic, image/heif, .heic, .heif" 
            onChange={(e) => {
              handleImageChange(e, setImage1, setPreview1);
              setModalImage(null);
            }} 
            style={{ display: 'none' }} 
          />
          {preview1 ? (
            <img 
              src={preview1} 
              alt="Current" 
              className={styles.thumbnailImage} 
              onClick={() => setModalImage({ src: preview1, id: 1 })}
            />
          ) : (
            <label htmlFor="file-input-1" className={styles.dropZone}>
              <span>Click to upload</span>
            </label>
          )}
        </div>

        <div className={styles.uploadBox}>
          <h3>Goal Persona</h3>
          <input 
            id="file-input-2"
            type="file" 
            accept="image/jpeg, image/png, image/webp, image/heic, image/heif, .heic, .heif" 
            onChange={(e) => {
              handleImageChange(e, setImage2, setPreview2);
              setModalImage(null);
            }} 
            style={{ display: 'none' }} 
          />
          {preview2 ? (
            <img 
              src={preview2} 
              alt="Goal" 
              className={styles.thumbnailImage} 
              onClick={() => setModalImage({ src: preview2, id: 2 })}
            />
          ) : (
            <label htmlFor="file-input-2" className={styles.dropZone}>
              <span>Click to upload</span>
            </label>
          )}
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
          'Analyze & Transform'
        )}
      </button>

      {results && <ResultsDisplay results={results} />}

      {modalImage && (
        <div className={styles.imageModalBackdrop} onClick={() => setModalImage(null)}>
          <div className={styles.imageModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.imageModalClose} onClick={() => setModalImage(null)}>
              &times;
            </button>
            <img src={modalImage.src} alt="Full Size" className={styles.fullSizeImage} />
            <label htmlFor={`file-input-${modalImage.id}`} className={styles.replaceImageBtn}>
              Replace Image
            </label>
          </div>
        </div>
      )}
    </main>
  );
}
