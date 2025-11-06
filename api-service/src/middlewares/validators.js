const { body, validationResult } = require('express-validator');

const validateCreateCliente = [
  body('nombre').isString().notEmpty(),
  body('email').isEmail(),
  body('telefono').isString().notEmpty(),
  body('direccion').isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateCliente = [
  body('nombre').optional().isString().notEmpty(),
  body('email').optional().isEmail(),
  body('telefono').optional().isString().notEmpty(),
  body('direccion').optional().isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateCreateMueble = [
  body('nombre').isString().notEmpty(),
  body('descripcion').isString().notEmpty(),
  body('precio').isNumeric(),
  body('categoria').isString().notEmpty(),
  body('stock').isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateMueble = [
  body('nombre').optional().isString().notEmpty(),
  body('descripcion').optional().isString().notEmpty(),
  body('precio').optional().isNumeric(),
  body('categoria').optional().isString().notEmpty(),
  body('stock').optional().isNumeric(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateStock = [
  body('stock').isInt({ min: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateCreateProveedor = [
  body('nombre').isString().notEmpty(),
  body('contacto').isString().notEmpty(),
  body('telefono').isString().notEmpty(),
  body('correo').isEmail(),
  body('direccion').isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateProveedor = [
  body('nombre').optional().isString().notEmpty(),
  body('contacto').optional().isString().notEmpty(),
  body('telefono').optional().isString().notEmpty(),
  body('correo').optional().isEmail(),
  body('direccion').optional().isString().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateCreatePresupuesto = [
  body('cliente_id').isUUID(),
  body('fecha_entrega').isISO8601().toDate(),
  body('items').isArray({ min: 1 }),
  body('items.*.mueble_id').isUUID(),
  body('items.*.cantidad').isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdatePresupuesto = [
  body('cliente_id').optional().isUUID(),
  body('fecha_entrega').optional().isISO8601().toDate(),
  body('estado').optional().isIn(['pendiente', 'convertido']),
  body('items').optional().isArray({ min: 1 }),
  body('items.*.mueble_id').optional().isUUID(),
  body('items.*.cantidad').optional().isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateCreatePedido = [
  body('cliente_id').isUUID(),
  body('presupuesto_id').optional().isUUID(),
  body('fecha_entrega').isISO8601().toDate(),
  body('estado').isIn(['orden', 'entregado', 'cancelado']),
  body('pago_estado').isIn(['pendiente', 'pagado']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdatePedido = [
  body('cliente_id').optional().isUUID(),
  body('presupuesto_id').optional().isUUID(),
  body('fecha_entrega').optional().isISO8601().toDate(),
  body('estado').optional().isIn(['orden', 'entregado', 'cancelado']),
  body('pago_estado').optional().isIn(['pendiente', 'pagado']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateCreateRemito = [
  body('pedido_id').isUUID(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUpdateRemito = [
  body('fecha_entrega').optional().isISO8601().toDate(),
  body('datos_legales').optional().isObject(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateCreateCliente,
  validateUpdateCliente,
  validateCreateMueble,
  validateUpdateMueble,
  validateUpdateStock,
  validateCreateProveedor,
  validateUpdateProveedor,
  validateCreatePresupuesto,
  validateUpdatePresupuesto,
  validateCreatePedido,
  validateUpdatePedido,
  validateCreateRemito,
  validateUpdateRemito,
};
