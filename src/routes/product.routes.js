const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/multer');

const parseFormDataNumbers = (req, res, next) => {
    if (req.body) {
        if (req.body.price !== undefined && req.body.price !== '') req.body.price = parseFloat(req.body.price);
        if (req.body.stock !== undefined && req.body.stock !== '') req.body.stock = parseInt(req.body.stock, 10);
    }
    next();
};

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', authenticate, authorize('admin'), upload.single('image'), parseFormDataNumbers, createProduct);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), parseFormDataNumbers, updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

module.exports = router;
