import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeleteModal.css';

/**
 * DELETE CONFIRMATION MODAL
 * 
 * Elegant dark overlay pop-up that forces the user to confirm irreversible
 * destructive actions (e.g. deleting an event or participant).
 */
export default function DeleteModal({ 
  isOpen, 
  title = "Confirmar Exclusão", 
  message = "Tem certeza de que deseja realizar esta ação? Isso não pode ser desfeito.", 
  onConfirm, 
  onCancel 
}) {
  
  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Lock scrolling
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = ''; // Release lock
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="modal-box animate-fade-in" 
        onClick={(e) => e.stopPropagation()} // Prevent closing on box click
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-header">
          <div className="title-area">
            <AlertTriangle className="icon-warning" size={22} />
            <h2>{title}</h2>
          </div>
          <button className="btn-close-x" onClick={onCancel} aria-label="Cancelar">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <footer className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Excluir Permanentemente
          </button>
        </footer>
      </div>
    </div>
  );
}
