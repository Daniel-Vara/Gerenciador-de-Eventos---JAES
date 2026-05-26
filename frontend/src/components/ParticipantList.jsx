import React, { useState } from 'react';
import { Users, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import './ParticipantList.css';

/**
 * PARTICIPANT LIST COMPONENT
 * 
 * Manages participant listing, dynamic inline additions,
 * editing forms, and triggering deletions.
 */
export default function ParticipantList({ 
  participants, 
  onAdd, 
  onUpdate, 
  onDelete,
  isEventCanceled
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');

  // Submit adding participant
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return alert("Nome é obrigatório");
    if (!newAge || isNaN(newAge) || parseInt(newAge) < 0) return alert("Por favor, insira uma idade válida");

    onAdd({
      name: newName.trim(),
      age: parseInt(newAge, 10)
    });

    // Reset Form
    setNewName('');
    setNewAge('');
    setIsAdding(false);
  };

  // Start edit mode
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditAge(p.age);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAge('');
  };

  // Submit edit
  const handleEditSubmit = (id) => {
    if (!editName.trim()) return alert("Nome é obrigatório");
    if (!editAge || isNaN(editAge) || parseInt(editAge) < 0) return alert("Por favor, insira uma idade válida");

    onUpdate(id, {
      name: editName.trim(),
      age: parseInt(editAge, 10)
    });

    setEditingId(null);
  };

  return (
    <div className="participant-section">
      <div className="participant-header">
        <div className="section-title">
          <Users className="title-icon" size={20} />
          <h3>Participantes Registrados ({participants.length})</h3>
        </div>

        {!isEventCanceled && !isAdding && (
          <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Adicionar Participante
          </button>
        )}
      </div>

      {/* Inline Register Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="add-participant-form animate-fade-in">
          <div className="form-inputs">
            <div className="form-group-inline">
              <input 
                type="text" 
                placeholder="Nome Completo" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-group-inline age-input">
              <input 
                type="number" 
                placeholder="Idade" 
                value={newAge} 
                onChange={(e) => setNewAge(e.target.value)}
                required
                min="0"
                max="120"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success btn-icon" title="Salvar Participante">
              <Check size={16} />
            </button>
            <button type="button" className="btn btn-secondary btn-icon" onClick={() => setIsAdding(false)} title="Cancelar">
              <X size={16} />
            </button>
          </div>
        </form>
      )}

      {/* Grid or Table List */}
      {participants.length === 0 ? (
        <div className="empty-participants">
          <p>Nenhum participante inscrito neste evento ainda.</p>
        </div>
      ) : (
        <div className="participants-grid">
          {participants.map((p) => {
            const isEditing = editingId === p.id;

            return (
              <div key={p.id} className="participant-row animate-fade-in">
                {isEditing ? (
                  // Inline Editing Controls
                  <div className="inline-edit-fields">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)}
                      required 
                    />
                    <input 
                      type="number" 
                      className="edit-age" 
                      value={editAge} 
                      onChange={(e) => setEditAge(e.target.value)}
                      required 
                      min="0"
                    />
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-icon" 
                        onClick={() => handleEditSubmit(p.id)}
                        title="Salvar Alterações"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        className="btn btn-secondary btn-icon" 
                        onClick={cancelEdit}
                        title="Cancelar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Read Only display row
                  <>
                    <div className="participant-info">
                      <span className="p-avatar">{p.name.charAt(0).toUpperCase()}</span>
                      <div className="p-details">
                        <span className="p-name">{p.name}</span>
                        <span className="p-age">{p.age} anos</span>
                      </div>
                    </div>

                    {!isEventCanceled && (
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={() => startEdit(p)}
                          title="Editar Informações"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon" 
                          onClick={() => onDelete(p.id)}
                          title="Remover Participante"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
