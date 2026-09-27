import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-branding">
          <h1 className="header-title">CityFlow</h1>
          <span className="header-divider" aria-hidden="true">|</span>
          <span className="header-subtitle">Urban Pressure Simulator</span>
        </div>
        <div className="header-status">
          <span className="status-indicator-dot" aria-hidden="true"></span>
          <span className="badge badge-info">SIMULATION MODE</span>
        </div>
      </div>
    </header>
  );
}
