import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Users, PlusCircle, LayoutDashboard, Menu, X } from 'lucide-react';
import './Navbar.css';

/**
 * RESPONSIVE NAVBAR COMPONENT
 * 
 * Styled with visual parity to the original JAES nav.
 * Features mobile hamburger controls, active route highlighting,
 * and high-contrast orange branding.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="main-nav">
      <div className="nav-container container">
        <NavLink to="/" className="nav-logo" onClick={closeMenu}>
          <div className="nav-logo-image-container">
            <img 
              src="/logo-jaes.png" 
              alt="Logo JAES" 
              className="nav-logo-image" 
              onError={(e) => {
                e.target.style.display = 'none';
                const svg = e.target.nextSibling;
                if (svg) svg.style.display = 'block';
              }} 
            />
            
            <svg 
              className="nav-logo-svg" 
              style={{ display: 'none' }}
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="#ff8c00" strokeWidth="2" />
              <path d="M16 2V6" stroke="#f8f9fa" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 2V6" stroke="#f8f9fa" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 9H21" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <path d="M9 14L11 16L15 12" stroke="#ff8c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="logo-brand-text">
            <span className="logo-accent">JAES - ST</span>
            <span className="logo-sub">GESTOR DE EVENTOS</span>
          </span>
        </NavLink>

        {/* Mobile Toggle Button */}
        <button 
          className="menu-toggle" 
          onClick={toggleMenu} 
          aria-label={isOpen ? "Fechar Menu" : "Abrir Menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'nav-open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
            end
          >
            <LayoutDashboard size={18} />
            <span>Painel</span>
          </NavLink>

          <NavLink 
            to="/create" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <PlusCircle size={18} />
            <span>Novo Evento</span>
          </NavLink>

          <NavLink 
            to="/participants" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <Users size={18} />
            <span>Participantes</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
