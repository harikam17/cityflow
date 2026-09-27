import React from 'react';

export default function Recommendations({ recommendations = [] }) {
  const isBaseline = recommendations.length === 0;

  return (
    <section aria-labelledby="recommendations-heading" className="panel recommendations-section">
      <div className="panel-header">
        <div>
          <h2 id="recommendations-heading" className="panel-title">Recommendations</h2>
          <span className="panel-subtitle">Deterministic rule-derived operational policies.</span>
        </div>
        <span className="badge badge-info">Rule-Based Decision Logic</span>
      </div>

      {isBaseline ? (
        <div className="recommendations-empty-state">
          <p className="empty-state-title">Baseline scenario selected.</p>
          <p className="empty-state-desc">
            Adjust the simulator controls or choose a preset to explore scenario impacts.
          </p>
        </div>
      ) : (
        <ul className="recommendations-list" aria-label="Generated scenario recommendations">
          {recommendations.map((rec) => (
            <li key={rec.id} className={`recommendation-item severity-${rec.severity}`}>
              <div className="rec-header">
                <span className="rec-category-tag">{rec.category}</span>
                <span className={`badge badge-${rec.severity}`}>
                  {rec.severity === 'critical' ? 'High Priority' : rec.severity === 'moderate' ? 'Advisory' : 'Positive Impact'}
                </span>
              </div>
              <p className="rec-text">{rec.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
