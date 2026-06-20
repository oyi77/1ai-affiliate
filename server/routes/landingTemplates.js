'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/templateController');

// Public — no auth required
router.get('/', ctrl.listPublic);

// Everything below requires authentication
router.use(authenticate);

router.get('/mine', ctrl.listMine);
router.post('/import', ctrl.importHtml);
router.post('/:id/duplicate', ctrl.duplicate);

router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
