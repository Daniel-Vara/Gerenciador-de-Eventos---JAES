/**
 * EVENT CONTROLLER
 * 
 * Manages incoming HTTP requests for event operations.
 * Validates inputs, invokes the EventModel, and sends uniform JSON responses.
 * Implements clean REST conventions (status codes: 200, 201, 400, 404, 500).
 */

const EventModel = require('../models/eventModel');
const ParticipantModel = require('../models/participantModel');

const EventController = {
  /**
   * GET /api/events
   * Lists events, with optional filter parameters ?search=... & ?status=...
   */
  getAllEvents: async (req, res) => {
    try {
      const { search = '', status = '' } = req.query;
      const events = await EventModel.getAll(search, status);
      res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      console.error('[Controller Error] getAllEvents:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar eventos do banco de dados.',
        error: error.message
      });
    }
  },

  /**
   * GET /api/events/:id
   * Retrieves single event details including the nested list of registered participants
   */
  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await EventModel.getById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Evento com ID ${id} não foi encontrado.`
        });
      }

      // Fetch associated participants using the participant model (One-to-Many query)
      const participants = await ParticipantModel.getByEventId(id);

      res.status(200).json({
        success: true,
        data: {
          ...event,
          participants
        }
      });
    } catch (error) {
      console.error('[Controller Error] getEventById:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao recuperar os detalhes do evento.',
        error: error.message
      });
    }
  },

  /**
   * POST /api/events
   * Registers a new active event
   */
  createEvent: async (req, res) => {
    try {
      const { event_name, description, event_date, event_location } = req.body;

      // Basic input validation
      if (!event_name || event_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'O nome do evento é obrigatório.' });
      }
      if (!event_date) {
        return res.status(400).json({ success: false, message: 'A data do evento é obrigatória.' });
      }
      if (!event_location || event_location.trim() === '') {
        return res.status(400).json({ success: false, message: 'O local do evento é obrigatório.' });
      }

      const insertId = await EventModel.create({
        event_name,
        description,
        event_date,
        event_location
      });

      res.status(201).json({
        success: true,
        message: 'Evento registrado com sucesso.',
        data: { id: insertId }
      });
    } catch (error) {
      console.error('[Controller Error] createEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao criar evento.',
        error: error.message
      });
    }
  },

  /**
   * PUT /api/events/:id
   * Edits core event attributes
   */
  updateEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { event_name, description, event_date, event_location, event_status } = req.body;

      if (!event_name || event_name.trim() === '') {
        return res.status(400).json({ success: false, message: 'O nome do evento não pode ser vazio.' });
      }
      if (!event_date) {
        return res.status(400).json({ success: false, message: 'A data do evento não pode ser vazia.' });
      }
      if (!event_location || event_location.trim() === '') {
        return res.status(400).json({ success: false, message: 'O local do evento não pode ser vazio.' });
      }

      const wasUpdated = await EventModel.update(id, {
        event_name,
        description,
        event_date,
        event_location,
        event_status
      });

      if (!wasUpdated) {
        return res.status(404).json({
          success: false,
          message: `Evento com ID ${id} não foi encontrado ou os dados não foram alterados.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Evento atualizado com sucesso.'
      });
    } catch (error) {
      console.error('[Controller Error] updateEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao atualizar evento.',
        error: error.message
      });
    }
  },

  /**
   * DELETE /api/events/:id
   * Destroys event and all dependent relational constraints (cascade deletes)
   */
  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const wasDeleted = await EventModel.delete(id);

      if (!wasDeleted) {
        return res.status(404).json({
          success: false,
          message: `Evento com ID ${id} não foi encontrado.`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Evento e todos os registros associados foram excluídos com sucesso.'
      });
    } catch (error) {
      console.error('[Controller Error] deleteEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao excluir evento.',
        error: error.message
      });
    }
  },

  /**
   * PUT /api/events/:id/complete
   * Transitions event status to 'completed' and records completion notes
   */
  completeEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { completion_date, notes } = req.body;

      const dateToRecord = completion_date || new Date().toISOString().split('T')[0];

      await EventModel.complete(id, {
        completion_date: dateToRecord,
        notes: notes || ''
      });

      res.status(200).json({
        success: true,
        message: 'O status do evento foi atualizado para concluído e os detalhes de conclusão foram registrados.'
      });
    } catch (error) {
      console.error('[Controller Error] completeEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao concluir evento.',
        error: error.message
      });
    }
  },

  /**
   * PUT /api/events/:id/cancel
   * Transitions event status to 'canceled' and records cancellation reason
   */
  cancelEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { cancellation_reason, cancellation_date } = req.body;

      if (!cancellation_reason || cancellation_reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'A razão do cancelamento é obrigatória para cancelar o evento.'
        });
      }

      const dateToRecord = cancellation_date || new Date().toISOString().split('T')[0];

      await EventModel.cancel(id, {
        cancellation_reason,
        cancellation_date: dateToRecord
      });

      res.status(200).json({
        success: true,
        message: 'O status do evento foi atualizado para cancelado e os detalhes de cancelamento foram registrados.'
      });
    } catch (error) {
      console.error('[Controller Error] cancelEvent:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao cancelar evento.',
        error: error.message
      });
    }
  }
};

module.exports = EventController;
