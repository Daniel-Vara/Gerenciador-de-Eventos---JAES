import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowLeft, Calendar, MapPin, AlignLeft, Info, RefreshCw } from 'lucide-react';
import { eventService } from '../services/api';
import './FormPage.css';

/**
 * EDIT EVENT PAGE COMPONENT
 * 
 * Fetches existing database details, populates the editing form,
 * and updates database columns upon submission.
 */
export default function EditEvent({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    event_date: '',
    event_location: '',
    event_status: 'EM_ANDAMENTO'
  });

  // Fetch current event values
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventService.getById(id);
        const { event_name, description, event_date, event_location, event_status } = response.data;
        
        // Format ISO Date into YYYY-MM-DD for form calendar inputs
        const formattedDate = event_date ? event_date.split('T')[0] : '';
        
        setFormData({
          event_name,
          description: description || '',
          event_date: formattedDate,
          event_location,
          event_status
        });
      } catch (error) {
        console.error('Erro ao buscar detalhes do evento para edição:', error);
        showToast('Falha ao recuperar informações do evento.', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.event_name.trim()) {
      return showToast('O Nome do Evento é obrigatório.', 'error');
    }
    if (!formData.event_date) {
      return showToast('A Data do Evento é obrigatória.', 'error');
    }
    if (!formData.event_location.trim()) {
      return showToast('O Local do Evento é obrigatório.', 'error');
    }

    setSaving(true);
    try {
      await eventService.update(id, formData);
      showToast('As informações do evento foram atualizadas com sucesso!', 'success');
      navigate(`/events/${id}`); // Go back to details view
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      showToast('Falha ao atualizar as alterações do evento.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container container">
        <RefreshCw className="spinner" size={32} />
        <p>Buscando valores do banco de dados...</p>
      </div>
    );
  }

  return (
    <div className="page-container container form-page-container">
      {/* Navigation and headers */}
      <header className="page-header animate-fade-in">
        <div className="page-title">
          <Link to={`/events/${id}`} className="btn-back">
            <ArrowLeft size={16} /> Cancelar Edição
          </Link>
          <h1>Editar Evento #{id}</h1>
          <p>Modifique os registros relacionais do evento #{id}.</p>
        </div>
      </header>

      {/* Editing Form */}
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
              value={formData.event_name}
              onChange={handleChange}
              maxLength="100"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date">
                <Calendar size={14} className="label-icon" /> Data
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
                <MapPin size={14} className="label-icon" /> Local
              </label>
              <input 
                type="text" 
                id="event_location"
                name="event_location"
                value={formData.event_location}
                onChange={handleChange}
                maxLength="150"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_status">Status do Evento</label>
              <select 
                id="event_status" 
                name="event_status" 
                value={formData.event_status}
                onChange={handleChange}
              >
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <AlignLeft size={14} className="label-icon" /> Descrição
            </label>
            <textarea 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              maxLength="1000"
            />
            <span className="textarea-counter">
              {formData.description.length}/1000 caracteres
            </span>
          </div>

          <div className="form-actions-panel">
            <Link to={`/events/${id}`} className="btn btn-secondary">
              Cancelar Alterações
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
            >
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
