import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Calendar, CheckSquare, AlertTriangle, RefreshCw, PlayCircle, CheckCircle2 } from 'lucide-react';
import { eventService } from '../services/api';
import EventCard from '../components/EventCard';
import DeleteModal from '../components/DeleteModal';
import './Dashboard.css';

/**
 * DASHBOARD PAGE COMPONENT
 * 
 * Provides an operational dashboard for event coordination.
 * Features separate sections for in-progress, completed, and canceled events,
 * real-time search, quick stats, and integrated delete confirmation flows.
 */
export default function Dashboard({ showToast }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Empty string means "All"

  // Stats counters
  const [stats, setStats] = useState({ active: 0, completed: 0, canceled: 0 });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Fetch events from Express API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Query events from API with our search and status filters
      const response = await eventService.getAll(search, statusFilter);
      setEvents(response.data);

      // Recalculate stats for the cards (by querying all events once)
      const allEventsResponse = await eventService.getAll(search, '');
      const allEvents = allEventsResponse.data;
      const active = allEvents.filter(e => e.event_status === 'EM_ANDAMENTO').length;
      const completed = allEvents.filter(e => e.event_status === 'CONCLUIDO').length;
      const canceled = allEvents.filter(e => e.event_status === 'CANCELADO').length;
      setStats({ active, completed, canceled });

    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Falha ao carregar eventos do servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run search query
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  // Handle click on delete button inside EventCard
  const handleDeleteClick = (id) => {
    setEventToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    try {
      await eventService.delete(eventToDelete);
      showToast('Evento excluído com sucesso!', 'success');
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
      fetchEvents(); // Refresh dashboard list
    } catch (error) {
      console.error('Error deleting event:', error);
      showToast('Falha ao excluir evento do banco de dados.', 'error');
    }
  };

  // Filter events into separate status sections
  const activeEvents = events.filter(e => e.event_status === 'EM_ANDAMENTO');
  const completedEvents = events.filter(e => e.event_status === 'CONCLUIDO');
  const canceledEvents = events.filter(e => e.event_status === 'CANCELADO');

  // Find name of event to delete for the modal prompt
  const eventNameToDelete = events.find(e => e.id === eventToDelete)?.event_name || '';

  return (
    <div className="page-container container">
      {/* 1. Page Header */}
      <header className="page-header animate-fade-in">
        <div className="page-title">
          <h1>Painel de Eventos</h1>
          <p>Gerencie, agende e coordene suas próximas atividades e tarefas.</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={20} /> Criar Novo Evento
        </Link>
      </header>

      {/* 2. Statistical Summary Panels */}
      <section className="stats-grid animate-fade-in">
        <div className={`stat-card stat-active ${statusFilter === 'EM_ANDAMENTO' ? 'stat-active-selected' : ''}`} onClick={() => setStatusFilter(statusFilter === 'EM_ANDAMENTO' ? '' : 'EM_ANDAMENTO')}>
          <div className="stat-icon-wrapper">
            <Calendar size={24} />
          </div>
          <div className="stat-details">
            <h3>Eventos em Andamento</h3>
            <span className="stat-count">{stats.active}</span>
          </div>
        </div>

        <div className={`stat-card stat-completed ${statusFilter === 'CONCLUIDO' ? 'stat-completed-selected' : ''}`} onClick={() => setStatusFilter(statusFilter === 'CONCLUIDO' ? '' : 'CONCLUIDO')}>
          <div className="stat-icon-wrapper">
            <CheckSquare size={24} />
          </div>
          <div className="stat-details">
            <h3>Concluídos</h3>
            <span className="stat-count">{stats.completed}</span>
          </div>
        </div>

        <div className={`stat-card stat-canceled ${statusFilter === 'CANCELADO' ? 'stat-canceled-selected' : ''}`} onClick={() => setStatusFilter(statusFilter === 'CANCELADO' ? '' : 'CANCELADO')}>
          <div className="stat-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <h3>Cancelados</h3>
            <span className="stat-count">{stats.canceled}</span>
          </div>
        </div>
      </section>

      {/* 3. Filters & Real-Time Search Panel */}
      <section className="search-filter-panel animate-fade-in">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar eventos por título..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          <button 
            className={`chip ${statusFilter === '' ? 'active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            Todos os Eventos
          </button>
          <button 
            className={`chip ${statusFilter === 'EM_ANDAMENTO' ? 'active' : ''}`}
            onClick={() => setStatusFilter('EM_ANDAMENTO')}
          >
            Em Andamento
          </button>
          <button 
            className={`chip ${statusFilter === 'CONCLUIDO' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CONCLUIDO')}
          >
            Concluídos
          </button>
          <button 
            className={`chip ${statusFilter === 'CANCELADO' ? 'active' : ''}`}
            onClick={() => setStatusFilter('CANCELADO')}
          >
            Cancelados
          </button>
        </div>
      </section>

      {/* 4. Categorized Sections Layout */}
      <section className="events-section">
        {loading ? (
          <div className="loading-container">
            <RefreshCw className="spinner" size={32} />
            <p>Carregando eventos do banco de dados...</p>
          </div>
        ) : (
          <div className="dashboard-sections-container">
            
            {/* COLUMN 1: Em Andamento */}
            {(statusFilter === '' || statusFilter === 'EM_ANDAMENTO') && (
              <div className="dashboard-column column-active animate-fade-in">
                <div className="column-header">
                  <PlayCircle size={18} className="icon-active" />
                  <h2>Eventos em Andamento ({activeEvents.length})</h2>
                </div>
                <div className="column-body">
                  {activeEvents.length === 0 ? (
                    <div className="empty-column-card">Nenhum evento em andamento.</div>
                  ) : (
                    activeEvents.map(event => (
                      <EventCard key={event.id} event={event} onDelete={handleDeleteClick} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* COLUMN 2: Concluídos */}
            {(statusFilter === '' || statusFilter === 'CONCLUIDO') && (
              <div className="dashboard-column column-completed animate-fade-in">
                <div className="column-header">
                  <CheckCircle2 size={18} className="icon-completed" />
                  <h2>Eventos Concluídos ({completedEvents.length})</h2>
                </div>
                <div className="column-body">
                  {completedEvents.length === 0 ? (
                    <div className="empty-column-card">Nenhum evento concluído.</div>
                  ) : (
                    completedEvents.map(event => (
                      <EventCard key={event.id} event={event} onDelete={handleDeleteClick} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* COLUMN 3: Cancelados */}
            {(statusFilter === '' || statusFilter === 'CANCELADO') && (
              <div className="dashboard-column column-canceled animate-fade-in">
                <div className="column-header">
                  <AlertTriangle size={18} className="icon-canceled" />
                  <h2>Eventos Cancelados ({canceledEvents.length})</h2>
                </div>
                <div className="column-body">
                  {canceledEvents.length === 0 ? (
                    <div className="empty-column-card">Nenhum evento cancelado.</div>
                  ) : (
                    canceledEvents.map(event => (
                      <EventCard key={event.id} event={event} onDelete={handleDeleteClick} />
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        title="Excluir Evento?"
        message={`Tem certeza de que deseja excluir permanentemente o evento "${eventNameToDelete}"? Essa ação removerá o evento do banco de dados e excluirá em cascata todos os participantes inscritos.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteModalOpen(false); setEventToDelete(null); }}
      />
    </div>
  );
}
