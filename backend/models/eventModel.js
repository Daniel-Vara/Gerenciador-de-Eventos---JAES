/**
 * EVENTS MODEL
 * 
 * Implements prepared raw SQL queries for managing events in MySQL.
 * Demonstrates advanced database features like JOINs, Subqueries, 
 * Transactions (ACID properties), and prepared statements to prevent SQL Injection.
 */

const db = require('../config/db');

const EventModel = {
  /**
   * Fetch all events with participant counts and outcomes,
   * support searching by name and filtering by status.
   */
  getAll: async (search = '', status = '') => {
    let sql = `
      SELECT e.*, 
             (SELECT COUNT(*) FROM participants p WHERE p.event_id = e.id) AS participant_count,
             co.completion_date, co.notes AS completion_notes,
             ca.cancellation_reason, ca.cancellation_date
      FROM events e
      LEFT JOIN completed_events co ON co.original_event_id = e.id
      LEFT JOIN canceled_events ca ON ca.original_event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (search.trim() !== '') {
      sql += ' AND e.event_name LIKE ?';
      params.push(`%${search}%`);
    }

    if (status.trim() !== '') {
      sql += ' AND e.event_status = ?';
      params.push(status);
    }

    // Sort by newest created
    sql += ' ORDER BY e.event_date DESC, e.created_at DESC';

    const [rows] = await db.query(sql, params);
    return rows;
  },

  /**
   * Fetch a single event by ID along with its details
   */
  getById: async (id) => {
    const sql = `
      SELECT e.*, 
             co.completion_date, co.notes AS completion_notes,
             ca.cancellation_reason, ca.cancellation_date
      FROM events e
      LEFT JOIN completed_events co ON co.original_event_id = e.id
      LEFT JOIN canceled_events ca ON ca.original_event_id = e.id
      WHERE e.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Create a new event. Defaults to 'active' status.
   */
  create: async (eventData) => {
    const { event_name, description, event_date, event_location } = eventData;
    const sql = `
      INSERT INTO events (event_name, description, event_date, event_location, event_status)
      VALUES (?, ?, ?, ?, 'EM_ANDAMENTO')
    `;
    const [result] = await db.query(sql, [event_name, description, event_date, event_location]);
    return result.insertId;
  },

  /**
   * Update event details
   */
  update: async (id, eventData) => {
    const { event_name, description, event_date, event_location, event_status } = eventData;
    const sql = `
      UPDATE events 
      SET event_name = ?, description = ?, event_date = ?, event_location = ?, event_status = ?
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [event_name, description, event_date, event_location, event_status || 'EM_ANDAMENTO', id]);
    return result.affectedRows > 0;
  },

  /**
   * Delete an event by ID.
   * Relational Integrity: Due to ON DELETE CASCADE constraints, this action
   * will automatically delete associated participants, completed_events and canceled_events.
   */
  delete: async (id) => {
    const sql = 'DELETE FROM events WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  },

  /**
   * Mark an event as Completed (using a DATABASE TRANSACTION)
   * Ensures either both the status is updated and completion details inserted, or none.
   */
  complete: async (id, completionData) => {
    const { completion_date, notes } = completionData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction(); // START TRANSACTION (ACID: Atomicity)

      // 1. Update event status to 'CONCLUIDO'
      const updateSql = "UPDATE events SET event_status = 'CONCLUIDO' WHERE id = ?";
      await connection.query(updateSql, [id]);

      // 2. Check if a completion note already exists (upsert)
      const checkSql = "SELECT id FROM completed_events WHERE original_event_id = ?";
      const [existing] = await connection.query(checkSql, [id]);

      if (existing.length > 0) {
        const updateCompSql = "UPDATE completed_events SET completion_date = ?, notes = ? WHERE original_event_id = ?";
        await connection.query(updateCompSql, [completion_date, notes, id]);
      } else {
        const insertCompSql = "INSERT INTO completed_events (original_event_id, completion_date, notes) VALUES (?, ?, ?)";
        await connection.query(insertCompSql, [id, completion_date, notes]);
      }

      // 3. Remove from canceled_events if it was previously canceled
      const deleteCancelSql = "DELETE FROM canceled_events WHERE original_event_id = ?";
      await connection.query(deleteCancelSql, [id]);

      await connection.commit(); // COMMIT TRANSACTION
      return true;
    } catch (error) {
      await connection.rollback(); // ROLLBACK TRANSACTION ON FAILURE
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Mark an event as Canceled (using a DATABASE TRANSACTION)
   */
  cancel: async (id, cancellationData) => {
    const { cancellation_reason, cancellation_date } = cancellationData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction(); // START TRANSACTION

      // 1. Update event status to 'CANCELADO'
      const updateSql = "UPDATE events SET event_status = 'CANCELADO' WHERE id = ?";
      await connection.query(updateSql, [id]);

      // 2. Check if cancellation record already exists (upsert)
      const checkSql = "SELECT id FROM canceled_events WHERE original_event_id = ?";
      const [existing] = await connection.query(checkSql, [id]);

      if (existing.length > 0) {
        const updateCancelSql = "UPDATE canceled_events SET cancellation_reason = ?, cancellation_date = ? WHERE original_event_id = ?";
        await connection.query(updateCancelSql, [cancellation_reason, cancellation_date, id]);
      } else {
        const insertCancelSql = "INSERT INTO canceled_events (original_event_id, cancellation_reason, cancellation_date) VALUES (?, ?, ?)";
        await connection.query(insertCancelSql, [id, cancellation_reason, cancellation_date]);
      }

      // 3. Remove from completed_events if it was previously completed
      const deleteCompSql = "DELETE FROM completed_events WHERE original_event_id = ?";
      await connection.query(deleteCompSql, [id]);

      await connection.commit(); // COMMIT TRANSACTION
      return true;
    } catch (error) {
      await connection.rollback(); // ROLLBACK
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = EventModel;
