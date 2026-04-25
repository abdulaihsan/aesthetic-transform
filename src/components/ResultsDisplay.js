import styles from './ResultsDisplay.module.css';

export default function ResultsDisplay({ results }) {
  if (!results) return null;

  return (
    <div className={styles.container}>
      <div>
        <h2 className={`${styles.sectionTitle} gradient-text`}>Aesthetic Analysis</h2>
        <div className={styles.grid}>
          <div className={`glass-panel ${styles.card}`}>
            <h3 className={styles.cardTitle}>🏋️ Physique</h3>
            <p className={styles.cardContent}>{results.comparison?.physique}</p>
          </div>
          <div className={`glass-panel ${styles.card}`}>
            <h3 className={styles.cardTitle}>👔 Style</h3>
            <p className={styles.cardContent}>{results.comparison?.style}</p>
          </div>
          <div className={`glass-panel ${styles.card}`}>
            <h3 className={styles.cardTitle}>✨ Aesthetics</h3>
            <p className={styles.cardContent}>{results.comparison?.aesthetics}</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 className={`${styles.sectionTitle} gradient-text`}>Your Transformation Routine</h2>
        <div className={styles.grid}>
          {results.routine?.map((item, index) => (
            <div key={index} className={`glass-panel ${styles.card}`}>
              <h3 className={styles.cardTitle}>
                {item.category.includes('Workout') ? '💪' : 
                 item.category.includes('Diet') ? '🥗' : 
                 item.category.includes('Grooming') ? '✂️' : '👕'} {item.category}
              </h3>
              <ul className={styles.routineList}>
                {item.steps?.map((step, idx) => (
                  <li key={idx} className={styles.routineItem}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
