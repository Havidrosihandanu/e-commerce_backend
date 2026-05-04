/**
 * Joi Validation Schemas
 * Semua schema validasi request body dikumpulkan di sini
 */

const Joi = require('joi');

// ─── Auth ──────────────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Nama minimal 2 karakter',
        'any.required': 'Nama wajib diisi',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Format email tidak valid',
        'any.required': 'Email wajib diisi',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password minimal 6 karakter',
        'any.required': 'Password wajib diisi',
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// ─── User Profile ──────────────────────────────────────────────────────────────
const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    no_telp: Joi.string().max(20).allow('', null),
    alamat: Joi.string().max(500).allow('', null),
}).min(1).messages({
    'object.min': 'Setidaknya satu field harus diisi',
});

// ─── Product ───────────────────────────────────────────────────────────────────
const productSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing', 'Other').required(),
    stock: Joi.number().integer().min(0).required(),
    image_url: Joi.string().uri().allow('', null),
    specs: Joi.object().allow(null),
});

const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(200),
    price: Joi.number().positive(),
    category: Joi.string().valid('CPU', 'Motherboard', 'RAM', 'Storage', 'GPU', 'PSU', 'Casing', 'Other'),
    stock: Joi.number().integer().min(0),
    image_url: Joi.string().uri().allow('', null),
    specs: Joi.object().allow(null),
}).min(1);

// ─── Cart ──────────────────────────────────────────────────────────────────────
const addCartSchema = Joi.object({
    product_id: Joi.number().integer().positive().required().messages({
        'any.required': 'product_id wajib diisi',
    }),
    qty: Joi.number().integer().min(1).required().messages({
        'number.min': 'Qty minimal 1',
        'any.required': 'qty wajib diisi',
    }),
});

const updateCartSchema = Joi.object({
    qty: Joi.number().integer().min(1).required().messages({
        'number.min': 'Qty minimal 1',
        'any.required': 'qty wajib diisi',
    }),
});

// ─── Order ─────────────────────────────────────────────────────────────────────
const createOrderSchema = Joi.object({
    shipping_address: Joi.string().min(5).required().messages({
        'any.required': 'Alamat pengiriman wajib diisi',
        'string.min': 'Alamat pengiriman minimal 5 karakter',
    }),
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'diproses', 'dikirim', 'selesai').required().messages({
        'any.only': 'Status harus salah satu dari: pending, diproses, dikirim, selesai',
        'any.required': 'Status wajib diisi',
    }),
});

// ─── PC Builder ────────────────────────────────────────────────────────────────
const validateComponentsSchema = Joi.object({
    cpu_id: Joi.number().integer().positive().required(),
    motherboard_id: Joi.number().integer().positive().allow(null),
    ram_id: Joi.number().integer().positive().allow(null),
    storage_id: Joi.number().integer().positive().allow(null),
    gpu_id: Joi.number().integer().positive().allow(null),
    psu_id: Joi.number().integer().positive().allow(null),
    casing_id: Joi.number().integer().positive().allow(null),
});

const createBuildSchema = Joi.object({
    name: Joi.string().max(100).allow('', null),
    cpu_id: Joi.number().integer().positive().required().messages({
        'any.required': 'CPU wajib dipilih terlebih dahulu',
    }),
    motherboard_id: Joi.number().integer().positive().allow(null),
    ram_id: Joi.number().integer().positive().allow(null),
    storage_id: Joi.number().integer().positive().allow(null),
    gpu_id: Joi.number().integer().positive().allow(null),
    psu_id: Joi.number().integer().positive().allow(null),
    casing_id: Joi.number().integer().positive().allow(null),
});

const checkoutBuildSchema = Joi.object({
    build_id: Joi.number().integer().positive().required(),
    shipping_address: Joi.string().min(5).required(),
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    productSchema,
    updateProductSchema,
    addCartSchema,
    updateCartSchema,
    createOrderSchema,
    updateOrderStatusSchema,
    validateComponentsSchema,
    createBuildSchema,
    checkoutBuildSchema,
};
