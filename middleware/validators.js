// Валидация и санитизация входных данных (express-validator).
const { body, param, validationResult } = require('express-validator');

const id = param('id').isMongoId().withMessage('Некорректный id');

exports.userCreate = [
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Пароль: 8–72 символа')
];
exports.userUpdate = [
  id,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 8, max: 72 })
];
exports.productCreate = [
  body('title').trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').optional().trim().isLength({ max: 1000 }).escape(),
  body('price').isFloat({ min: 0 }).toFloat(),
  body('stock').optional().isInt({ min: 0 }).toInt()
];
exports.productUpdate = [
  id,
  body('title').optional().trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').optional().trim().isLength({ max: 1000 }).escape(),
  body('price').optional().isFloat({ min: 0 }).toFloat(),
  body('stock').optional().isInt({ min: 0 }).toInt()
];
exports.login = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().notEmpty().isLength({ max: 72 })
];
exports.idOnly = [id];

// Прерывает запрос, если валидация не пройдена
exports.check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};
