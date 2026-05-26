import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Calendar, MapPin, AlignLeft, Info } from 'lucide-react';
import { eventService } from '../services/api';
import './FormPage.css';

/**
 * CREATE EVENT PAGE COMPONENT
 * 
 * Elegant form UI aligned with the JAES modern aesthetics.
 * Uses robust form validation and loading state boundaries.
 */
export default function CreateEvent({ showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    event_date: '',
    event_location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Front-end validations
    if (!formData.event_name.trim()) {
      return showToast('O Título do Evento é obrigatório.', 'error');
    }
    if (!formData.event_date) {
      return showToast('A Data do Evento é obrigatória.', 'error');
    }
    if (!formData.event_location.trim()) {
      return showToast('O Local do Evento é obrigatório.', 'error');
    }

    setLoading(true);
    try {
      await eventService.create(formData);
      showToast('Evento criado com sucesso!', 'success');
      navigate('/'); // Redirect to dashboard
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao criar evento.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container container form-page-container">
      {/* Back button and page title */}
      <header className="page-header animate-fade-in">
        <div className="page-title">
          <Link to="/" className="btn-back">
            <ArrowLeft size={16} /> Voltar para Dashboard
          </Link>
          <h1>Criar Novo Evento</h1>
          <p>Registre uma nova tarefa ou evento no banco de dados relacional.</p>
        </div>
      </header>

      {/* Main Form container */}
      <div className="form-card hover-float animate-fade-in">
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="event_name">
              <Info size={14} className="label-icon" /> Título do Evento
            </label>
            <input 
              type="text" 
              id="event_name"
              name="event_name"
              placeholder="e.g. Annual Company Gala"
              value={formData.event_name}
              onChange={handleChange}
              maxLength="100"
              required
            />
            <span className="input-helper">Máximo 100 caracteres. Mantenha-o breve e claro.</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date">
                <Calendar size={14} className="label-icon" /> Data Agendada
              </label>
              <input 
                type="date" 
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="event_location">
                <MapPin size={14} className="label-icon" /> Local do Evento
              </label>
              <input 
                type="text" 
                id="event_location"
                name="event_location"
                placeholder="e.g. São Paulo Expo"
                value={formData.event_location}
                onChange={handleChange}
                maxLength="150"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <AlignLeft size={14} className="label-icon" /> Descrição
            </label>
            <textarea 
              id="description"
              name="description"
              placeholder="Descreva detalhadamente as tarefas, cronogramas, objetivos ou instruções..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              maxLength="1000"
            />
            <span className="textarea-counter">
              {formData.description.length}/1000 characters
            </span>
          </div>

          <div className="form-actions-panel">
            <Link to="/" className="btn btn-secondary">
              Cancelar
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Evento'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
