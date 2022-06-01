const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');

router.get('/:id', monitorController.getMonitor);

router.get('/', monitorController.getMonitors);

router.patch('/:id', monitorController.updateMonitor);

router.post('/', monitorController.insertMonitor);

router.post('/:id/start', monitorController.startMonitor);

router.post('/:id/stop', monitorController.stopMonitor);

router.delete('/:id', monitorController.deleteMonitor);

module.exports = router;