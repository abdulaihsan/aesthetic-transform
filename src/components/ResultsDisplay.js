'use client';

import { useState } from 'react';
import styles from './ResultsDisplay.module.css';

const renderTextWithBold = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--primary-hover)' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function ResultsDisplay({ results }) {
  const [selectedChange, setSelectedChange] = useState(null);

  if (!results) return null;

  return (
    <div className={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className={`${styles.sectionTitle} gradient-text`}>{results.category_of_change || "Transformation Plan"}</h2>
        <p className={styles.cardContent} style={{ fontSize: '1.1rem' }}>
          <strong>Intensity/Speed Required:</strong> {results.how_to_change_rate}
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className={styles.compactGrid}>
          {results.detailed_changes?.map((item, index) => (
            <div 
              key={index} 
              className={`glass-panel ${styles.gridCard}`}
              onClick={() => setSelectedChange(item)}
            >
              <h3 className={styles.cardTitle}>{renderTextWithBold(item.change_header)}</h3>
              <p className={styles.cardContent} style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Click to view details
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedChange && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedChange(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedChange(null)}>
              &times;
            </button>
            <h2 className={styles.modalTitle}>{renderTextWithBold(selectedChange.change_header)}</h2>
            
            <div className={styles.stateComparison}>
              <div className={styles.stateBox}>
                <span className={styles.stateLabel}>Current State</span>
                <p className={styles.stateText}>{renderTextWithBold(selectedChange.current_state)}</p>
              </div>
              <div className={styles.stateBox}>
                <span className={styles.stateLabel}>Target State</span>
                <p className={styles.stateText}>{renderTextWithBold(selectedChange.target_state)}</p>
              </div>
            </div>

            {selectedChange.action_variables && selectedChange.action_variables.length > 0 && (
              <div className={styles.tableContainer}>
                <table className={styles.actionTable}>
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChange.action_variables.map((v, i) => (
                      <tr key={i}>
                        <td>{v.variable_name}</td>
                        <td>{v.variable_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <ul className={styles.routineList}>
              {selectedChange.action_steps?.map((step, idx) => (
                <li key={idx} className={styles.routineItem}>{renderTextWithBold(step)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
