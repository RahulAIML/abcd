const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');

router.get('/cvs', cvController.getAllCVs);
router.get('/cvs/search', cvController.searchCVs);
router.get('/cvs/:id', cvController.getCVById);
router.post('/cvs', cvController.createCV);
router.put('/cvs/:id', cvController.updateCV);

module.exports = router;
