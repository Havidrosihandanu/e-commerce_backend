/**
 * PC Builder Routes
 * GET  /api/builder/components  - public (opsional filter ?cpu_id=)
 * POST /api/builder/validate    - public (tidak perlu login untuk validasi)
 * POST /api/builder             - customer: simpan build
 * GET  /api/builder/my          - customer: daftar build
 * POST /api/builder/checkout    - customer: checkout dari build
 */

const express = require('express');
const router = express.Router();

const {
    getComponents, validateBuild, createBuild, getMyBuilds, checkoutBuild,
} = require('../controllers/builder.controller');

const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
    validateComponentsSchema, createBuildSchema, checkoutBuildSchema,
} = require('../utils/schemas');

// Public / semi-public routes
router.get('/components', getComponents);
router.post('/validate', validate(validateComponentsSchema), validateBuild);

// Customer-only routes (harus login)
// PENTING: /my dan /checkout harus sebelum /:id
router.get('/my', authenticate, getMyBuilds);
router.post('/checkout', authenticate, validate(checkoutBuildSchema), checkoutBuild);
router.post('/', authenticate, validate(createBuildSchema), createBuild);

module.exports = router;
