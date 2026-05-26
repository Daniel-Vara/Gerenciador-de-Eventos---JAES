/**
 * PARTICIPANTS ROUTES
 * 
 * Maps HTTP requests to respective participant controller actions.
 * Grouped under /api/participants namespace.
 */

const express = require('express');
const router = express.Router();
const ParticipantController = require('../controllers/participantController');

router.get('/', ParticipantController.getAllParticipants);
router.post('/', ParticipantController.createParticipant);
router.put('/:id', ParticipantController.updateParticipant);
router.delete('/:id', ParticipantController.deleteParticipant);

module.exports = router;
