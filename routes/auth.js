const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/AuthController');
const v = require('../middleware/validators');
const { requireAuth } = require('../middleware/auth');

// Строгий лимит на вход и регистрацию: защита от подбора паролей
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Слишком много попыток, повторите позже' } });

router.get('/login', c.loginPage);
router.post('/register', authLimiter, v.userCreate, v.check, c.register);
router.post('/login', authLimiter, v.login, v.check, c.login);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);
module.exports = router;
