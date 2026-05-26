/**
 * CENTRALIZED API SERVICE
 * 
 * Sets up an Axios instance connected to our local Node.js Express server.
 * Defines easy-to-use asynchronous methods for all event and participant endpoints.
 */

import axios from 'axios';

// Connect to the local Express backend on Port 5000
const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

export const eventService = {
  /**
   * List all events, with optional real-time search queries and status filters
   */
  getAll: async (search = '', status = '') => {
    const response = await apiClient.get('/events', {
      params: { search, status }
    });
    return response.data;
  },

  /**
   * Fetch single event details including the registered participant array
   */
  getById: async (id) => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Create a new event
   */
  create: async (eventData) => {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  },

  /**
   * Update existing event data
   */
  update: async (id, eventData) => {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  },

  /**
   * Delete an event by ID (cascades database-side)
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },

  /**
   * Transition event to 'completed' status and save completion notes
   */
  complete: async (id, completionData) => {
    const response = await apiClient.put(`/events/${id}/complete`, completionData);
    return response.data;
  },

  /**
   * Transition event to 'canceled' status and record cancellation reason
   */
  cancel: async (id, cancellationData) => {
    const response = await apiClient.put(`/events/${id}/cancel`, cancellationData);
    return response.data;
  },
};

export const participantService = {
  /**
   * Fetch all participants enrolled in the database (with joined event titles)
   */
  getAll: async () => {
    const response = await apiClient.get('/participants');
    return response.data;
  },

  /**
   * Enroll a participant into a specific event
   */
  create: async (participantData) => {
    const response = await apiClient.post('/participants', participantData);
    return response.data;
  },

  /**
   * Update participant details (name, age)
   */
  update: async (id, participantData) => {
    const response = await apiClient.put(`/participants/${id}`, participantData);
    return response.data;
  },

  /**
   * Remove/disenroll a participant by ID
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/participants/${id}`);
    return response.data;
  }
};

export default apiClient;
