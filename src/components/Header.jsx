import React from 'react';

export default function Header({ onCopyLink, copied, onPrint }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-branding">
          <h1 className="header-title">CityFlow</h1>
          <span className="header-divider" aria-hidden="true">|</span>
          <span className="header-subtitle">Bengaluru what-if simulator for traffic, freight and waste</span>
        </div>
        <div className="header-actions no-print">
          <button type="button" className="btn btn-sm btn-outline" onClick={onCopyLink}>
            {copied ? 'Link copied' : 'Copy scenario link'}
          </button>
          <button type="button" className="btn btn-sm btn-outline" onClick={onPrint}>
            Print briefing
          </button>
        </div>
      </div>
    </header>
  );
}
