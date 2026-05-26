/**
 * EVENT ROUTES
 * 
 * Maps HTTP requests to the respective controller actions.
 * Grouped logically under /api/events namespace.
 */

const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');

// Standard CRUD endpoints
router.get('/', EventController.getAllEvents);
router.post('/', EventController.createEvent);

router.get('/:id', EventController.getEventById);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

// Status outcome transitions
router.put('/:id/complete', EventController.completeEvent);
router.put('/:id/cancel', EventController.cancelEvent);

module.exports = router;
