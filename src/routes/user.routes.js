/**
 * User Routes
 * GET /api/users/me
 * PUT /api/users/me
 */

const express = require('express');
const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../utils/schemas');

// Semua route user membutuhkan autentikasi
router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);

module.exports = router;
