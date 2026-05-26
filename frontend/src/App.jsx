import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventDetails from './pages/EventDetails';
import Participants from './pages/Participants';
import Toast from './components/Toast';
import './App.css';

/**
 * CENTRAL APPLICATION SHELL
 * 
 * Configures the React Router navigation, maintains stateful global toast,
 * renders standard JAES-themed header + footer layout grids.
 */
function App() {
  const [toast, setToast] = useState(null);

  // Expose toast notifier function as callback to pages
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <Router>
      <div className="app-wrapper">
        {/* Sticky Header Nav */}
        <Navbar />

        {/* Global Floating Toast Alerts Container */}
        {toast && (
          <div className="toast-container">
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={clearToast} 
            />
          </div>
        )}

        {/* Main Routed Content Viewport */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard showToast={showToast} />} />
            <Route path="/create" element={<CreateEvent showToast={showToast} />} />
            <Route path="/events/:id" element={<EventDetails showToast={showToast} />} />
            <Route path="/events/:id/edit" element={<EditEvent showToast={showToast} />} />
            <Route path="/participants" element={<Participants showToast={showToast} />} />
          </Routes>
        </main>

        {/* Academic Presentation Footer */}
        <footer>
          <div className="container">
            <p>© 2026 JAES-ST - Gestor de Eventos e Tarefas | Apresentação de Desenvolvimento de Sistemas de Banco de Dados</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>
              React + Node.js + Express + Conexão MySQL Local
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
