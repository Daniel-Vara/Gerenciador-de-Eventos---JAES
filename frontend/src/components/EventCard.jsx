import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckCircle2, AlertOctagon, PlayCircle } from 'lucide-react';
import './EventCard.css';

/**
 * EVENT CARD COMPONENT
 * 
 * Visually inspired by JAES activity cards.
 * Incorporates micro-animations, glassmorphism, responsive data badges,
 * and a status highlight (Em Andamento, Concluído, Cancelado).
 */
export default function EventCard({ event, onDelete }) {
  const {
    id,
    event_name,
    description,
    event_date,
    event_location,
    event_status,
    participant_count
  } = event;

  // Format date to local standard (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  // Get status badge configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONCLUIDO':
        return {
          label: 'Concluído',
          className: 'status-completed',
          icon: <CheckCircle2 size={14} />
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          className: 'status-canceled',
          icon: <AlertOctagon size={14} />
        };
      default:
        return {
          label: 'Em Andamento',
          className: 'status-active',
          icon: <PlayCircle size={14} />
        };
    }
  };

  const statusConfig = getStatusConfig(event_status);

  return (
    <article className="event-card hover-float animate-fade-in">
      <header className="event-card-header">
        <span className={`status-badge ${statusConfig.className}`}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
        
        <span className="participant-badge" title="Participantes Registrados">
          <Users size={14} />
          <span>{participant_count || 0}</span>
        </span>
      </header>

      <div className="event-card-content">
        <h3 className="event-title">{event_name}</h3>
        <p className="event-description">
          {description && description.trim() !== '' 
            ? (description.length > 120 ? `${description.slice(0, 120)}...` : description)
            : 'Nenhuma descrição fornecida.'}
        </p>
      </div>

      <footer className="event-card-footer">
        <div className="meta-info">
          <div className="meta-item">
            <Calendar size={14} className="meta-icon" />
            <span>{formatDate(event_date)}</span>
          </div>
          <div className="meta-item">
            <MapPin size={14} className="meta-icon" />
            <span className="truncate">{event_location}</span>
          </div>
        </div>

        <div className="card-actions">
          <Link to={`/events/${id}`} className="btn-manage">
            Gerenciar
          </Link>
          <button onClick={() => onDelete(id)} className="btn-delete-card" title="Excluir Evento">
            Excluir
          </button>
        </div>
      </footer>
    </article>
  );
}
