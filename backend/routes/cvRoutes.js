const express = require('express');
const { body, param } = require('express-validator');
const cvController = require('../controllers/cvController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/cvs', cvController.getAllCVs);
router.get('/cvs/search', cvController.searchCVs);
router.get(
  '/cvs/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid id required')],
  validate,
  cvController.getCVById
);

router.post(
  '/cvs',
  requireAuth,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('keyprogramming').trim().notEmpty().withMessage('Key programming required'),
    body('education').trim().notEmpty().withMessage('Education required'),
    body('profile').trim().notEmpty().withMessage('Profile required'),
    body('URLlinks').trim().notEmpty().withMessage('URL links required')
  ],
  validate,
  cvController.createCV
);

router.put(
  '/cvs/:id',
  requireAuth,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid id required'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('keyprogramming').trim().notEmpty().withMessage('Key programming required'),
    body('education').trim().notEmpty().withMessage('Education required'),
    body('profile').trim().notEmpty().withMessage('Profile required'),
    body('URLlinks').trim().notEmpty().withMessage('URL links required')
  ],
  validate,
  cvController.updateCV
);

module.exports = router;
