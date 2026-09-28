import React from 'react';

const SEVERITY_LABEL = { critical: 'Act now', moderate: 'Watch', safe: 'On track' };

export default function Recommendations({ recommendations = [] }) {
  return (
    <section aria-labelledby="recommendations-heading" className="panel recommendations-section">
      <div className="panel-header">
        <div>
          <h2 id="recommendations-heading" className="panel-title">What to do</h2>
          <span className="panel-subtitle">
            Each fix is found by re-running the model until the problem clears, so the numbers are what the model says is enough.
          </span>
        </div>
      </div>

      <ul className="recommendations-list" aria-label="Recommendations for this scenario">
        {recommendations.map((rec) => (
          <li key={rec.id} className={`recommendation-item severity-${rec.severity}`}>
            <div className="rec-header">
              <span className="rec-category-tag">{rec.category}</span>
              <span className={`badge badge-${rec.severity}`}>{SEVERITY_LABEL[rec.severity]}</span>
            </div>
            <p className="rec-title">{rec.title}</p>
            <p className="rec-text">{rec.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
