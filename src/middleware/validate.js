/**
 * Validation Middleware
 * Membungkus schema Joi untuk validasi request body
 */

/**
 * validate(schema)
 * Gunakan di route: router.post('/', validate(mySchema), controller)
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
            return res.status(400).json({
                message: 'Validasi gagal',
                errors: messages,
            });
        }

        next();
    };
};

module.exports = { validate };
