// Controller: регистрация, вход, выход.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const html = req => req.accepts(['json', 'html']) === 'html';

// Фиктивный хеш: bcrypt.compare выполняется даже для несуществующего email (выравнивает время ответа)
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 12);
const cookieOpts = { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' };
const safe = u => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

function issueToken(res, user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
  res.cookie('token', token, { ...cookieOpts, maxAge: 60 * 60 * 1000 });
  return token;
}

exports.loginPage = (req, res) => res.render('login', { error: null });

exports.register = async (req, res, next) => {        // POST /auth/register
  try {
    const { name, email, password } = req.body;         // role задать нельзя: всегда 'customer'
    const user = await User.create({ name, email, password });
    const token = issueToken(res, user);
    html(req) ? res.redirect('/') : res.status(201).json({ token, user: safe(user) });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {           // POST /auth/login
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !ok) {                                 // одинаковое сообщение: нет подсказки, что email существует
      const msg = 'Неверный email или пароль';
      return html(req) ? res.status(401).render('login', { error: msg }) : res.status(401).json({ error: msg });
    }
    const token = issueToken(res, user);
    html(req) ? res.redirect('/') : res.json({ token, user: safe(user) });
  } catch (e) { next(e); }
};

exports.logout = (req, res) => {                      // POST /auth/logout
  res.clearCookie('token', cookieOpts);
  html(req) ? res.redirect('/auth/login') : res.json({ ok: true });
};

exports.me = (req, res) => res.json(safe(req.user));  // GET /auth/me
