import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Edit, Trash2, ArrowLeft, CheckCircle2, AlertOctagon, HelpCircle, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { eventService, participantService } from '../services/api';
import ParticipantList from '../components/ParticipantList';
import DeleteModal from '../components/DeleteModal';
import './EventDetails.css';

/**
 * EVENT DETAILS PAGE (COMMAND HUB)
 * 
 * Comprehensive command deck for managing a single event.
 * Coordinates deletion confirmation flow, outcome status changes (Complete/Cancel),
 * details rendering, and participants addition, modification, and disenrollment.
 */
export default function EventDetails({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Loader and details states
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Outcome submission panel toggle states
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  // Form states
  const [compNotes, setCompNotes] = useState('');
  const [compDate, setCompDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDate, setCancelDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal triggers
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch complete event and nested participants
  const fetchEventDetails = async () => {
    try {
      const response = await eventService.getById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do evento:', error);
      showToast('Evento não encontrado ou falha ao buscar detalhes.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  // Handle Event Deletion
  const handleDeleteEvent = async () => {
    try {
      await eventService.delete(id);
      showToast('Evento excluído com sucesso!', 'sucesso');
      setIsDeleteModalOpen(false);
      navigate('/'); // Go back to dashboard
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      showToast('Falha ao excluir evento do banco de dados.', 'error');
    }
  };

  // Submit completion outcome
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventService.complete(id, {
        completion_date: compDate,
        notes: compNotes.trim()
      });
      showToast('Evento marcado como concluído!', 'sucesso');
      setShowCompleteForm(false);
      fetchEventDetails(); // Reload page data
    } catch (error) {
      console.error('Erro ao concluir evento:', error);
      showToast('Falha ao marcar evento como concluído.', 'erro');
    }
  };

  // Submit cancellation outcome
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      return showToast('A razão do cancelamento é obrigatória.', 'erro');
    }

    try {
      await eventService.cancel(id, {
        cancellation_reason: cancelReason.trim(),
        cancellation_date: cancelDate
      });
      showToast('O status do evento foi atualizado para cancelado.', 'sucesso');
      setShowCancelForm(false);
      fetchEventDetails(); // Reload data
    } catch (error) {
      console.error('Erro ao cancelar evento:', error);
      showToast('Falha ao cancelar evento.', 'erro');
    }
  };

  // Add Participant callback
  const handleAddParticipant = async (participantData) => {
    try {
      await participantService.create({
        ...participantData,
        event_id: parseInt(id, 10)
      });
      showToast('Participante registrado com sucesso!', 'sucesso');
      fetchEventDetails(); // Refresh nested list
    } catch (error) {
      console.error('Erro ao registrar participante:', error);
      const errorMsg = error.response?.data?.message || 'Falha ao adicionar participante.';
      showToast(errorMsg, 'erro');
    }
  };

  // Update Participant callback
  const handleUpdateParticipant = async (pId, participantData) => {
    try {
      await participantService.update(pId, participantData);
      showToast('Registro do participante atualizado.', 'successo');
      fetchEventDetails();
    } catch (error) {
      console.error('Erro ao atualizar participante:', error);
      showToast('Falha ao atualizar informações do participante.', 'erro');
    }
  };

  // Delete Participant callback
  const handleDeleteParticipant = async (pId) => {
    try {
      await participantService.delete(pId);
      showToast('Participante removido do evento.', 'sucesso');
      fetchEventDetails();
    } catch (error) {
      console.error('Erro ao remover participante:', error);
      showToast('Falha ao remover participante.', 'erro');
    }
  };

  if (loading) {
    return (
      <div className="loading-container container">
        <RefreshCw className="spinner" size={32} />
        <p>Carregando registro de dados #${id}...</p>
      </div>
    );
  }

  // Format Date (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONCLUIDO': return 'Concluído';
      case 'CANCELADO': return 'Cancelado';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      default: return status || 'Em Andamento';
    }
  };

  return (
    <div className="page-container container event-details-container">
      {/* 1. Nav back */}
      <Link to="/" className="btn-back">
        <ArrowLeft size={16} /> Voltar para o Painel
      </Link>

      <div className="details-layout animate-fade-in">
        
        {/* LEFT COLUMN: Main details and status updates */}
        <div className="details-main-column">
          
          {/* Main Info Card */}
          <div className="info-card">
            <header className="info-card-header">
              <span className={`status-badge ${event.event_status === 'CONCLUIDO' ? 'status-completed' : event.event_status === 'CANCELADO' ? 'status-canceled' : 'status-active'}`}>
                {event.event_status === 'CONCLUIDO' && <CheckCircle2 size={14} />}
                {event.event_status === 'CANCELADO' && <AlertOctagon size={14} />}
                {event.event_status === 'EM_ANDAMENTO' && <HelpCircle size={14} />}
                {getStatusText(event.event_status)}
              </span>

              <div className="quick-actions">
                <Link to={`/events/${id}/edit`} className="btn btn-secondary btn-icon" title="Editar Detalhes do Evento">
                  <Edit size={16} />
                </Link>
                <button 
                  className="btn btn-danger btn-icon" 
                  onClick={() => setIsDeleteModalOpen(true)}
                  title="Excluir Evento"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>

            <h1 className="details-title">{event.event_name}</h1>
            
            <div className="details-meta-grid">
              <div className="meta-block">
                <Calendar size={18} className="meta-icon" />
                <div className="meta-text">
                  <span className="meta-label">Data do Evento</span>
                  <span className="meta-val">{formatDate(event.event_date)}</span>
                </div>
              </div>

              <div className="meta-block">
                <MapPin size={18} className="meta-icon" />
                <div className="meta-text">
                  <span className="meta-label">Local</span>
                  <span className="meta-val">{event.event_location}</span>
                </div>
              </div>
            </div>

            <div className="details-description">
              <h3>Descrição</h3>
              <p>{event.description || 'Nenhuma nota detalhada fornecida para esta tarefa.'}</p>
            </div>
          </div>

          {/* HISTORICAL COMPLETED / CANCELED INFORMATION PANELS */}
          {event.event_status === 'CONCLUIDO' && (
            <div className="history-panel completed-panel animate-fade-in">
              <div className="panel-header">
                <CheckCircle2 size={20} className="icon-success" />
                <h3>Metadados de Conclusão</h3>
              </div>
              <p className="history-date"><strong>Data Arquivada:</strong> {formatDate(event.completion_date)}</p>
              <div className="history-notes">
                <strong>Notas Administrativas:</strong>
                <p>{event.completion_notes || 'Nenhuma nota salva.'}</p>
              </div>
            </div>
          )}

          {event.event_status === 'CANCELADO' && (
            <div className="history-panel canceled-panel animate-fade-in">
              <div className="panel-header">
                <AlertOctagon size={20} className="icon-danger" />
                <h3>Metadados de Cancelamento</h3>
              </div>
              <p className="history-date"><strong>Data de Registro:</strong> {formatDate(event.cancellation_date)}</p>
              <div className="history-notes">
                <strong>Razão do Cancelamento:</strong>
                <p>{event.cancellation_reason}</p>
              </div>
            </div>
          )}

          {/* STATUS OUTCOME ACTION CARDS */}
          {event.event_status === 'EM_ANDAMENTO' && !showCompleteForm && !showCancelForm && (
            <div className="outcome-selection-card animate-fade-in">
              <h3>Registrar Resolução do Evento</h3>
              <p>Esta tarefa foi concluída ou precisa ser cancelada?</p>
              <div className="outcome-buttons">
                <button 
                  className="btn btn-success" 
                  onClick={() => setShowCompleteForm(true)}
                >
                  Marcar Concluído
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => setShowCancelForm(true)}
                >
                  Cancelar Evento
                </button>
              </div>
            </div>
          )}

          {/* COMPLETION SUBMIT PANEL */}
          {showCompleteForm && (
            <div className="outcome-form-card animate-fade-in">
              <h3>Marcar Evento como Concluído</h3>
              <form onSubmit={handleCompleteSubmit}>
                <div className="form-group">
                  <label htmlFor="compDate">Data de Conclusão</label>
                  <input 
                    type="date" 
                    id="compDate"
                    value={compDate} 
                    onChange={(e) => setCompDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="compNotes">Notas de Conclusão e Revisão</label>
                  <textarea 
                    id="compNotes"
                    placeholder="Forneça detalhes sobre o resultado, conquistas da equipe ou acompanhamentos..."
                    value={compNotes}
                    onChange={(e) => setCompNotes(e.target.value)}
                    rows="3"
                  />
                </div>
                <div className="form-actions-inline">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCompleteForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success btn-sm">
                    <Send size={14} /> Enviar Resolução
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CANCELLATION SUBMIT PANEL */}
          {showCancelForm && (
            <div className="outcome-form-card animate-fade-in">
              <h3>Marcar Evento como Cancelado</h3>
              <form onSubmit={handleCancelSubmit}>
                <div className="form-group">
                  <label htmlFor="cancelDate">Data de Cancelamento</label>
                  <input 
                    type="date" 
                    id="cancelDate"
                    value={cancelDate} 
                    onChange={(e) => setCancelDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cancelReason">Razão do Cancelamento (Obrigatório)</label>
                  <textarea 
                    id="cancelReason"
                    placeholder="Forneça uma explicação detalhada sobre o motivo do cancelamento do evento ou tarefa..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows="3"
                    required
                  />
                </div>
                <div className="form-actions-inline">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCancelForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-danger btn-sm">
                    <Send size={14} /> Confirmar Cancelamento
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Participant administration */}
        <div className="details-sidebar-column">
          <ParticipantList 
            participants={event.participants || []}
            onAdd={handleAddParticipant}
            onUpdate={handleUpdateParticipant}
            onDelete={handleDeleteParticipant}
            isEventCanceled={event.event_status === 'CANCELADO'}
          />
        </div>

      </div>

      {/* Irreversible delete confirmation modal */}
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        title="Excluir Evento?"
        message={`Tem certeza de que deseja excluir permanentemente o evento "${event.event_name}"? Isso excluirá em cascata todos os participantes inscritos (${event.participants?.length || 0}) e históricos de resultados associados a este evento.`}
        onConfirm={handleDeleteEvent}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
