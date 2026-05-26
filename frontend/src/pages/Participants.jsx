import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, RefreshCw, Calendar, MapPin, Eye } from 'lucide-react';
import { participantService } from '../services/api';
import './Participants.css';

/**
 * GLOBAL PARTICIPANTS DIRECTORY
 * 
 * Aggregates and lists all participants from the local MySQL database.
 * Highlights JOIN operations by showcasing which event each person is enrolled in.
 * Includes instant client-side name filtering.
 */
export default function Participants({ showToast }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await participantService.getAll();
        setParticipants(response.data);
      } catch (error) {
        console.error('Erro ao buscar participantes globais:', error);
        showToast('Falha ao carregar diretório de participantes.', 'erro');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  // Filter list by typing search queries
  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format Date (DD/MM/YYYY)
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="page-container container">
      {/* Page Header */}
      <header className="page-header animate-fade-in">
        <div className="page-title">
          <h1>Diretório de participantes</h1>
          <p>Visão global do banco de dados de todos os membros inscritos em todos os eventos ativos, concluídos e cancelados.</p>
        </div>
      </header>

      {/* Search Filter Box */}
      <section className="directory-filter animate-fade-in">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar no diretório por nome de membro ou título do evento..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Directory Content */}
      <section className="directory-content">
        {loading ? (
          <div className="loading-container">
            <RefreshCw className="spinner" size={32} />
            <p>Buscando no diretório do banco de dados...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="no-participants-card animate-fade-in">
            <Users size={48} className="empty-icon" />
            <h3>Nenhum participante encontrado</h3>
            <p>
              {searchQuery 
                ? 'Tente editar a grafia da sua pesquisa ou redefinir as consultas.'
                : 'Inscreva participantes nas páginas de detalhes de eventos individuais!'}
            </p>
          </div>
        ) : (
          <div className="directory-table-wrapper animate-fade-in">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Detalhes do participante</th>
                  <th>Idade</th>
                  <th>Evento inscrito</th>
                  <th>Local e data</th>
                  <th className="actions-header">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="directory-row">
                    <td>
                      <div className="table-p-info">
                        <span className="p-avatar">{p.name.charAt(0).toUpperCase()}</span>
                        <span className="table-p-name">{p.name}</span>
                      </div>
                    </td>
                    
                    <td>
                      <span className="table-p-age">{p.age} yrs</span>
                    </td>

                    <td>
                      <Link to={`/events/${p.event_id}`} className="table-event-link">
                        {p.event_name}
                      </Link>
                    </td>

                    <td>
                      <div className="table-meta-group">
                        <span className="table-meta-item">
                          <MapPin size={12} className="meta-icon" /> {p.event_location}
                        </span>
                        <span className="table-meta-item">
                          <Calendar size={12} className="meta-icon" /> {formatDate(p.event_date)}
                        </span>
                      </div>
                    </td>

                    <td className="actions-cell">
                      <Link to={`/events/${p.event_id}`} className="btn btn-secondary btn-icon" title="View Event Details">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
