/**
 * PARTICIPANTS MODEL
 * 
 * Implements prepared raw SQL queries for managing participants in MySQL.
 * Demonstrates foreign key navigation and relational mapping (JOIN queries).
 */

const db = require('../config/db');

const ParticipantModel = {
  /**
   * Fetch all participants across all events (with event details)
   */
  getAll: async () => {
    const sql = `
      SELECT p.*, e.event_name, e.event_date, e.event_location
      FROM participants p
      INNER JOIN events e ON p.event_id = e.id
      ORDER BY e.event_date DESC, p.name ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  /**
   * Fetch participants registered for a specific event
   */
  getByEventId: async (eventId) => {
    const sql = `
      SELECT * FROM participants 
      WHERE event_id = ? 
      ORDER BY name ASC
    `;
    const [rows] = await db.query(sql, [eventId]);
    return rows;
  },

  /**
   * Fetch a single participant by ID
   */
  getById: async (id) => {
    const sql = 'SELECT * FROM participants WHERE id = ?';
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  /**
   * Add a participant to an event
   */
  create: async (participantData) => {
    const { name, age, event_id } = participantData;
    const sql = `
      INSERT INTO participants (name, age, event_id) 
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(sql, [name, age, event_id]);
    return result.insertId;
  },

  /**
   * Update participant details
   */
  update: async (id, participantData) => {
    const { name, age } = participantData;
    const sql = `
      UPDATE participants 
      SET name = ?, age = ? 
      WHERE id = ?
    `;
    const [result] = await db.query(sql, [name, age, id]);
    return result.affectedRows > 0;
  },

  /**
   * Remove a participant from an event
   */
  delete: async (id) => {
    const sql = 'DELETE FROM participants WHERE id = ?';
    const [result] = await db.query(sql, [id]);
    return result.affectedRows > 0;
  }
};

module.exports = ParticipantModel;
