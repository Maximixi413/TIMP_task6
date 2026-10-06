// Аутентификация (JWT) и авторизация (роли).
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const html = req => req.accepts(['json', 'html']) === 'html';

// Токен берётся из httpOnly-cookie (браузер) или заголовка Authorization: Bearer (Postman/API)
function getToken(req) {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) return h.slice(7);
  return req.cookies && req.cookies.token;
}

// Глобально: определяет текущего пользователя (или null) и передаёт его в шаблоны.
// Пользователь каждый раз загружается из БД, поэтому удаление или смена роли действуют сразу.
exports.attachUser = async (req, res, next) => {
  try {
    req.user = null;
    const token = getToken(req);
    if (token) {
      try {
        const { sub } = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        req.user = await User.findById(sub);
      } catch (e) { /* недействительный или просроченный токен -> гость */ }
    }
    res.locals.user = req.user;
    next();
  } catch (e) { next(e); }
};

// Требует входа в систему
exports.requireAuth = (req, res, next) => {
  if (req.user) return next();
  return html(req) ? res.redirect('/auth/login') : res.status(401).json({ error: 'Требуется аутентификация' });
};

// Требует одну из указанных ролей (RBAC)
exports.requireRole = (...roles) => [
  exports.requireAuth,
  (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: 'Недостаточно прав' })
];
