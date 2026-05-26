/**
 * PARTICIPANT CONTROLLER
 * 
 * Manages HTTP endpoints for adding, updating, and removing event participants.
 * Protects database integrity by validating data types (e.g. integer age limits) before inserting.
 */

const ParticipantModel = require('../models/participantModel');
const EventModel = require('../models/eventModel');

const ParticipantController = {
  /**
   * GET /api/participants
   * Lists all participants in the database with their associated event names
   */
  getAllParticipants: async (req, res) => {
    try {
      const participants = await ParticipantModel.getAll();
      res.status(200).json({
        success: true,
        count: participants.length,
        data: participants
      });
    } catch (error) {
      console.error('[Controller Error] getAllParticipants:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao recuperar a lista de participantes.',
        error: error.message
      });
    }
  },

  /**
   * POST /api/participants
   * Enrolls a new participant into a specific event
   */
  createParticipant: async (req, res) => {
    try {
      const { name, age, event_id } = req.body;

      // 1. Validation checks
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'O nome do participante é obrigatório.' });
      }
      if (age === undefined || age === null || isNaN(parseInt(age, 10)) || parseInt(age, 10) < 0) {
        return res.status(400).json({ success: false, message: 'Uma idade válida e positiva é obrigatória.' });
      }
      if (!event_id) {
        return res.status(400).json({ success: false, message: 'O ID do evento associado é obrigatório.' });
      }

      // 2. Relational Check: Verify the target event actually exists before registering the participant
      const parentEvent = await EventModel.getById(event_id);
      if (!parentEvent) {
        return res.status(404).json({
          success: false,
          message: `Não é possível adicionar o participante. O evento com ID ${event_id} não existe.`
        });
      }

      // 3. Prevent adding participants to Canceled events
      if (parentEvent.event_status === 'canceled') {
        return res.status(400).json({
          success: false,
          message: 'Não é possível inscrever participantes em um evento cancelado.'
        });
      }

      const insertId = await ParticipantModel.create({
        name,
        age: parseInt(age, 10),
        event_id
      });

      res.status(201).json({
        success: true,
        message: 'Participante inscrito com sucesso.',
        data: { id: insertId }
      });
    } catch (error) {
      console.error('[Controller Error] createParticipant:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao inscrever participante.',
        error: error.message
      });
    }
  },

  /**
   * PUT /api/participants/:id
   * Modifies participant information (name/age)
   */
  updateParticipant: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, age } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'O nome do participante não pode ser vazio.' });
      }
      if (age === undefined || age === null || isNaN(parseInt(age, 10)) || parseInt(age, 10) < 0) {
        return res.status(400).json({ success: false, message: 'Uma idade válida e positiva é obrigatória.' });
      }

      const wasUpdated = await ParticipantModel.update(id, {
        name,
        age: parseInt(age, 10)
      });

      if (!wasUpdated) {
        return res.status(404).json({
          success: false,
          message: `Participante com ID ${id} não foi encontrado ou os dados não foram alterados.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Informações do participante atualizadas com sucesso.'
      });
    } catch (error) {
      console.error('[Controller Error] updateParticipant:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao atualizar o participante.',
        error: error.message
      });
    }
  },

  /**
   * DELETE /api/participants/:id
   * Disenrolls/deletes a participant record
   */
  deleteParticipant: async (req, res) => {
    try {
      const { id } = req.params;
      const wasDeleted = await ParticipantModel.delete(id);

      if (!wasDeleted) {
        return res.status(404).json({
          success: false,
          message: `Participante com ID ${id} não foi encontrado.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Participante removido com sucesso.'
      });
    } catch (error) {
      console.error('[Controller Error] deleteParticipant:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao remover o participante.',
        error: error.message
      });
    }
  }
};

module.exports = ParticipantController;
